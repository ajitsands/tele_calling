<?php
// backend/public/index.php

// Auto-loader for Namespaced Classes (Core and App)
spl_autoload_register(function ($class) {
    $prefixMap = [
        'Core\\' => __DIR__ . '/../core/',
        'App\\Controllers\\' => __DIR__ . '/../app/Controllers/',
        'App\\Models\\' => __DIR__ . '/../app/Models/',
        'App\\Services\\' => __DIR__ . '/../app/Services/'
    ];

    foreach ($prefixMap as $prefix => $baseDir) {
        if (str_starts_with($class, $prefix)) {
            $relativeClass = substr($class, strlen($prefix));
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
});

use Core\Router;
use App\Controllers\AuthController;
use App\Controllers\DeviceController;
use App\Controllers\CallController;
use App\Controllers\CustomerController;
use App\Controllers\RecordingController;
use App\Controllers\EventStreamController;

$router = new Router();

// Authentication & Users
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->get('/api/users', [AuthController::class, 'listUsers']);
$router->post('/api/users/theme', [AuthController::class, 'updateTheme']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);

// Devices & Shift Assignments
$router->get('/api/devices', [DeviceController::class, 'index']);
$router->post('/api/devices/assign', [DeviceController::class, 'assignShift']);
$router->post('/api/devices/release', [DeviceController::class, 'releaseShift']);
$router->post('/api/devices/heartbeat', [DeviceController::class, 'heartbeat']);
$router->post('/api/devices/register', [DeviceController::class, 'register']);

// Calls & Telephony Ingestion
$router->post('/api/calls/event', [CallController::class, 'ingestEvent']);
$router->get('/api/calls/active', [CallController::class, 'getActiveCall']);
$router->post('/api/calls/{id}/disposition', [CallController::class, 'saveDisposition']);
$router->get('/api/calls', [CallController::class, 'index']);
$router->get('/api/calls/stats', [CallController::class, 'stats']);

// Customers / CRM
$router->get('/api/customers', [CustomerController::class, 'index']);
$router->get('/api/customers/{id}', [CustomerController::class, 'show']);
$router->post('/api/customers', [CustomerController::class, 'store']);

// Call Recordings
$router->post('/api/recordings/upload', [RecordingController::class, 'upload']);
$router->get('/api/recordings/{id}/stream', [RecordingController::class, 'stream']);

// Realtime SSE & Polling Event Stream
$router->get('/api/realtime/latest', [EventStreamController::class, 'latest']);
$router->get('/api/realtime/stream', [EventStreamController::class, 'stream']);

// Dispatch Request
$router->dispatch();

