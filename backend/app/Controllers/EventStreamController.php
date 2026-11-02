<?php
// backend/app/Controllers/EventStreamController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class EventStreamController extends Controller {
    public function latest(): void {
        $eventFile = __DIR__ . '/../../storage/active_event.json';
        if (file_exists($eventFile)) {
            $content = file_get_contents($eventFile);
            $eventData = json_decode($content, true);

            if ($eventData && !empty($eventData['timestamp'])) {
                $eventTime = strtotime($eventData['timestamp']);
                $isRecent = (time() - $eventTime) < 20; // Only consider events from last 20 seconds
                $isCleared = in_array($eventData['event'] ?? '', ['CLEARED', 'NONE', 'ENDED', 'MISSED', 'REJECTED']);

                if ($isRecent && !$isCleared) {
                    $this->success('Latest event', ['event' => $eventData]);
                    return;
                }
            }
        }
        $this->success('No active event', ['event' => null]);
    }

    public function clear(): void {
        $eventFile = __DIR__ . '/../../storage/active_event.json';
        file_put_contents($eventFile, json_encode([
            'event' => 'CLEARED',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        $this->success('Active event cleared');
    }

    public function stream(): void {
        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        header('X-Accel-Buffering: no');

        $user = $this->getAuthUser();
        $targetUserId = $user ? (int)$user['id'] : 0;

        $eventFile = __DIR__ . '/../../storage/active_event.json';
        $lastMtime = 0;

        echo "event: ping\n";
        echo "data: " . json_encode(['time' => time(), 'status' => 'connected']) . "\n\n";
        flush();

        $startTime = time();
        $timeout = 25;

        while (time() - $startTime < $timeout) {
            if (file_exists($eventFile)) {
                $mtime = filemtime($eventFile);
                if ($mtime > $lastMtime) {
                    $lastMtime = $mtime;
                    $content = file_get_contents($eventFile);
                    $eventData = json_decode($content, true);

                    if ($eventData && ($eventData['event'] ?? '') === 'RINGING') {
                        $eventUser = (int)($eventData['user_id'] ?? 0);
                        $isAuthorized = ($targetUserId === 0 || $eventUser === $targetUserId || ($user && $user['role'] === 'ADMIN'));

                        if ($isAuthorized) {
                            echo "event: call_event\n";
                            echo "data: " . json_encode($eventData) . "\n\n";
                            flush();
                        }
                    }
                }
            }

            usleep(250000);
        }

        echo "event: ping\n";
        echo "data: " . json_encode(['time' => time(), 'status' => 'reconnect']) . "\n\n";
        flush();
        exit;
    }
}
