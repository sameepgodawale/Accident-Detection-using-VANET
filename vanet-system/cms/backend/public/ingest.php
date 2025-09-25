<?php
require __DIR__ . '/../config/config.example.php';
header('Content-Type: application/json');
$body = file_get_contents('php://input');
$data = json_decode($body, true);
if (!$data) { http_response_code(400); echo json_encode(['error'=>'invalid_json']); exit; }
// naive write to file log for demo; in prod insert to DB
$logfile = '/tmp/cms_ingest.log';
file_put_contents($logfile, date('c') . ' ' . json_encode($data) . "\n", FILE_APPEND);
echo json_encode(['status'=>'ok']);
?>
