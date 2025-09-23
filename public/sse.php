<?php
// SSE endpoint: streams new accident events from MySQL in real-time
require '../config/config.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo "data: " . json_encode(['error' => 'DB connection failed']) . "\n\n";
    flush();
    exit;
}

$lastId = 0;

while (true) {
    $stmt = $pdo->prepare("SELECT * FROM events WHERE id > :lastId ORDER BY id ASC LIMIT 10");
    $stmt->execute([':lastId' => $lastId]);
    $rows = $stmt->fetchAll();

    foreach ($rows as $row) {
        $lastId = $row['id'];
        $event = [
            'id' => $row['id'],
            'device_id' => $row['device_id'],
            'event_type' => $row['event_type'],
            'severity' => $row['severity'],
            'latitude' => (float)$row['latitude'],
            'longitude' => (float)$row['longitude'],
            'timestamp' => $row['timestamp']
        ];
        echo "data: " . json_encode($event) . "\n\n";
        ob_flush();
        flush();
    }

    sleep(3);
}
?>