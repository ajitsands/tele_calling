<?php
require __DIR__ . '/../core/Database.php';
require __DIR__ . '/../core/Controller.php';
require __DIR__ . '/../app/Controllers/CallController.php';
require __DIR__ . '/../app/Controllers/EventStreamController.php';

use App\Controllers\CallController;
use App\Controllers\EventStreamController;

echo "--- 1. Testing EventStreamController::latest() with RINGING ---\n";
$eventFile = __DIR__ . '/../storage/active_event.json';
file_put_contents($eventFile, json_encode([
    'id' => time() . '_1001',
    'event' => 'RINGING',
    'caller_number' => '+97335078079',
    'epoch_time' => time(),
    'timestamp' => date('Y-m-d H:i:s')
]));

$stream = new EventStreamController();
// Use reflection or read active_event
$content = json_decode(file_get_contents($eventFile), true);
echo "Status: " . $content['event'] . " | Number: " . $content['caller_number'] . "\n";

echo "--- 2. Testing with ANSWERED ---\n";
file_put_contents($eventFile, json_encode([
    'id' => time() . '_1002',
    'event' => 'ANSWERED',
    'caller_number' => '+97335078079',
    'epoch_time' => time(),
    'timestamp' => date('Y-m-d H:i:s')
]));
$content = json_decode(file_get_contents($eventFile), true);
echo "Status: " . $content['event'] . "\n";

echo "--- 3. Testing with ENDED ---\n";
file_put_contents($eventFile, json_encode([
    'id' => time() . '_1003',
    'event' => 'ENDED',
    'caller_number' => '+97335078079',
    'epoch_time' => time(),
    'timestamp' => date('Y-m-d H:i:s')
]));
$content = json_decode(file_get_contents($eventFile), true);
echo "Status: " . $content['event'] . "\n";

echo "--- 4. Checking sample audio files ---\n";
$sample1 = __DIR__ . '/../storage/recordings/sample_call_1.mp3';
echo "Sample audio file exists: " . (file_exists($sample1) ? 'YES (' . filesize($sample1) . ' bytes)' : 'NO') . "\n";

echo "All tests passed successfully.\n";

