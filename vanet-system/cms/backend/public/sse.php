<?php
// Demo SSE endpoint - streams entries from a logfile (/tmp/cms_ingest.log)
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
$log = '/tmp/cms_ingest.log';
$lastSize = 0;
while (true) {
    clearstatcache();
    if (file_exists($log)) {
        $size = filesize($log);
        if ($size > $lastSize) {
            $f = fopen($log,'r'); fseek($f, $lastSize);
            while (($line = fgets($f)) !== false) {
                echo "data: " . json_encode(['raw'=>$line]) . "\n\n";
                ob_flush(); flush();
            }
            $lastSize = ftell($f);
            fclose($f);
        }
    }
    sleep(2);
}
?>
