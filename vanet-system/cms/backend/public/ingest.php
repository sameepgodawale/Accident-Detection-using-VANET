<?php $d=json_decode(file_get_contents('php://input'),true); file_put_contents('/tmp/cms_ingest.log', json_encode($d)."\n", FILE_APPEND); echo json_encode(['status'=>'ok']); ?>
