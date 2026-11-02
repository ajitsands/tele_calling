package com.telecalling.companion

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.Timer
import java.util.TimerTask

class TelephonyTrackingService : Service() {

    private var heartbeatTimer: Timer? = null

    companion object {
        private const val TAG = "TelephonyService"
        private const val CHANNEL_ID = "telecalling_tracking_channel"
        private const val NOTIFICATION_ID = 1001

        fun start(context: Context) {
            try {
                val intent = Intent(context, TelephonyTrackingService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Throwable) {
                Log.e(TAG, "Failed to start foreground service: ${e.message}")
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        try {
            createNotificationChannel()
            val notification = buildNotification()
            
            // Pass the exact FOREGROUND_SERVICE_TYPE_DATA_SYNC required for Android 14+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID, 
                    notification, 
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
            scheduleHeartbeat()
        } catch (e: Throwable) {
            Log.e(TAG, "Error starting foreground service in onCreate", e)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    private fun scheduleHeartbeat() {
        try {
            heartbeatTimer?.cancel()
            heartbeatTimer = Timer()
            heartbeatTimer?.scheduleAtFixedRate(object : TimerTask() {
                override fun run() {
                    try {
                        val bm = getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
                        val battery = bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 100
                        NetworkManager.sendHeartbeat(applicationContext, battery)
                    } catch (e: Throwable) {
                        Log.w(TAG, "Heartbeat error: ${e.message}")
                    }
                }
            }, 1000L, 30000L)
        } catch (e: Throwable) {
            Log.e(TAG, "Failed to schedule heartbeat", e)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("TeleCalling Gateway Active")
            .setContentText("Monitoring calls & syncing with telecalling terminal")
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "TeleCalling Gateway Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        heartbeatTimer?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
