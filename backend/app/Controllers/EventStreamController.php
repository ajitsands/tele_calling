<?php
// backend/app/Controllers/EventStreamController.php

namespace App\Controllers;

use Core\Controller;
use Core\Database;

class EventStreamController extends Controller {
    public function stream(): void {
        // Disable output buffering
        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        header('X-Accel-Buffering: no'); // For Nginx if used

        $user = $this->getAuthUser();
        $targetUserId = $user ? (int)$user['id'] : 0;

        $eventFile = __DIR__ . '/../../storage/active_event.json';
        $lastMtime = 0;

        // Send initial heartbeat
        echo "event: ping\n";
        echo "data: " . json_encode(['time' => time(), 'status' => 'connected']) . "\n\n";
        flush();

        $startTime = time();
        $timeout = 25; // 25 seconds per connection, browser auto-reconnects cleanly

        while (time() - $startTime < $timeout) {
            if (file_exists($eventFile)) {
                $mtime = filemtime($eventFile);
                if ($mtime > $lastMtime) {
                    $lastMtime = $mtime;
                    $content = file_get_contents($eventFile);
                    $eventData = json_decode($content, true);

                    if ($eventData) {
                        // Check if event belongs to this user or if user is admin
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

            usleep(250000); // Check every 250ms for low latency
        }

        echo "event: ping\n";
        echo "data: " . json_encode(['time' => time(), 'status' => 'reconnect']) . "\n\n";
        flush();
        exit;
    }
}

