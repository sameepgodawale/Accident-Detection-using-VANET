<?php
require '../config/config.php';
header('Content-Type: application/json');
echo json_encode(['status'=>'ingest endpoint ready']);
?>