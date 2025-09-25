<?php
// ingest.php
// Production-ready CMS ingestion endpoint
// - Expects JSON POST from RSU (signed via API key header X-API-KEY)
// - Validates required fields
// - Deduplicates by event_uuid
// - Inserts into MySQL (prepared statements)
// - Appends audit log to /var/log/vanet_cms_ingest.log (container-friendly path)

declare(strict_types=1);

$CONFIG = [
    'db_host' => getenv('DB_HOST') ?: 'db',
    'db_name' => getenv('DB_NAME') ?: 'vanet_cms',
    'db_user' => getenv('DB_USER') ?: 'root',
    'db_pass' => getenv('DB_PASS') ?: 'password',

    // For demo: use a simple API key map; replace with mTLS or vault in prod
    'valid_api_keys' => [
        // example: 'RSU-SIM-01' => 'supersecretkey1'
        'RSU_KEY_EXAMPLE' => 'replace-me-with-real-key'
    ],

    'audit_log' => '/var/log/vanet_cms_ingest.log',
];

function http_error(int $code, string $msg) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['error' => $msg]);
    exit;
}

function get_api_key() : ?string {
    $h = $_SERVER['HTTP_X_API_KEY'] ?? null;
    if ($h) return trim($h);
    // allow ?api_key= in query for quick local testing (not recommended)
    if (isset($_GET['api_key'])) return trim($_GET['api_key']);
    return null;
}

// 1) Authentication (API key)
$api_key = get_api_key();
if (!$api_key) {
    http_error(401, 'Missing API key');
}
if (!in_array($api_key, $CONFIG['valid_api_keys'], true) && !array_key_exists($api_key, array_flip($CONFIG['valid_api_keys']))) {
    // The config above stores keys as values for demo compatibility
    // In production store mapping RSU_ID -> key and validate.
    // We'll accept if key exists in values
    if (!in_array($api_key, $CONFIG['valid_api_keys'], true)) {
        http_error(403, 'Invalid API key');
    }
}

// 2) Read and parse body
$raw = file_get_contents('php://input');
if (!$raw) {
    http_error(400, 'Empty request body');
}
$body = json_decode($raw, true);
if ($body === null) {
    http_error(400, 'Invalid JSON');
}

// 3) Basic validation & normalization
$required = ['event_uuid','device_id','event_type','timestamp','lat','lon'];
foreach ($required as $r) {
    if (!array_key_exists($r, $body) || $body[$r] === '') {
        http_error(422, "Missing required field: $r");
    }
}

// validate types
$event_uuid = substr((string)$body['event_uuid'],0,36);
$device_id  = (string)$body['device_id'];
$event_type = strtoupper((string)$body['event_type']);
$ts_text    = (string)$body['timestamp'];
$lat        = floatval($body['lat']);
$lon        = floatval($body['lon']);
$speed      = isset($body['speed']) ? floatval($body['speed']) : null;
$rsu_id     = isset($body['rsu_id']) ? (string)$body['rsu_id'] : null;
$rssi       = isset($body['rssi']) ? floatval($body['rssi']) : null;

// Timestamp parsing (accept ISO8601); fall back to now
$ts = date('Y-m-d H:i:s', strtotime($ts_text) ?: time());

// Optional payload stored as JSON string
$payload_json = null;
if (isset($body['payload'])) {
    $payload_json = json_encode($body['payload'], JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
} else {
    // store a compact copy of the original raw body
    $payload_json = json_encode($body, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
}

// 4) Connect to DB (PDO)
$dsn = "mysql:host={$CONFIG['db_host']};dbname={$CONFIG['db_name']};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $CONFIG['db_user'], $CONFIG['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_error(500, 'Database connection failed');
}

// 5) Deduplicate: check existing event_uuid
try {
    $check = $pdo->prepare('SELECT id FROM events WHERE event_uuid = :uuid LIMIT 1');
    $check->execute([':uuid' => $event_uuid]);
    $row = $check->fetch();
    if ($row) {
        // Already exists — respond with 409 and the event id
        header('Content-Type: application/json');
        http_response_code(409);
        echo json_encode(['status'=>'duplicate','event_id'=>$row['id']]);
        // Still write audit log for visibility
        file_put_contents($CONFIG['audit_log'], date('c') . " DUPLICATE event_uuid={$event_uuid} device={$device_id} rsu_key=" . $api_key . PHP_EOL, FILE_APPEND | LOCK_EX);
        exit;
    }
} catch (PDOException $e) {
    http_error(500, 'DB error during dedupe check');
}

// 6) Insert into events table
try {
    $ins = $pdo->prepare('
        INSERT INTO events (event_uuid, device_id, rsu_id, event_type, severity, confidence, latitude, longitude, speed_kmh, payload, timestamp, created_at)
        VALUES (:event_uuid, :device_id, :rsu_id, :event_type, :severity, :confidence, :latitude, :longitude, :speed_kmh, :payload, :timestamp, NOW())
    ');
    // severity/confidence unknown at ingest; default to MINOR/0
    $ins->execute([
        ':event_uuid' => $event_uuid,
        ':device_id'  => $device_id,
        ':rsu_id'     => $rsu_id,
        ':event_type' => $event_type,
        ':severity'   => 'MINOR',
        ':confidence' => 0.0,
        ':latitude'   => $lat,
        ':longitude'  => $lon,
        ':speed_kmh'  => $speed !== null ? $speed : null,
        ':payload'    => $payload_json,
        ':timestamp'  => $ts,
    ]);
    $event_id = (int)$pdo->lastInsertId();
} catch (PDOException $e) {
    http_error(500, 'DB insert failed');
}

// 7) Log audit (append)
$audit_line = date('c') . " INGEST event_id={$event_id} uuid={$event_uuid} device={$device_id} rsu_id={$rsu_id} api_key=" . substr($api_key,0,6) . PHP_EOL;
@file_put_contents($CONFIG['audit_log'], $audit_line, FILE_APPEND | LOCK_EX);

// 8) Publish to Redis / queue (optional) - for demo we skip; in prod push to Redis/EQ
// e.g. $redis->publish('events.new', json_encode(['event_id'=>$event_id,...]));

// 9) Response
header('Content-Type: application/json');
echo json_encode(['status'=>'ok','event_id'=>$event_id]);
exit;
