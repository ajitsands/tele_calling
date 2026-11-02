package com.telecalling.companion

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.URL
import java.util.Locale
import java.util.concurrent.Executors

object NetworkManager {
    private const val TAG = "NetworkManager"
    private val executor = Executors.newSingleThreadExecutor()

    fun getServerUrl(context: Context): String {
        val prefs = context.getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
        return prefs.getString("server_url", "http://192.168.8.11:8000") ?: "http://192.168.8.11:8000"
    }

    fun getDeviceUuid(context: Context): String {
        val prefs = context.getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
        var uuid = prefs.getString("device_uuid", null)
        if (uuid == null) {
            uuid = "dev-" + Build.MODEL.replace(" ", "-").lowercase() + "-" + (1000..9999).random()
            prefs.edit().putString("device_uuid", uuid).apply()
        }
        return uuid
    }

    fun getLocalIpAddress(context: Context): String {
        try {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            if (wifiManager != null) {
                val ip = wifiManager.connectionInfo.ipAddress
                if (ip != 0) {
                    return String.format(
                        Locale.getDefault(),
                        "%d.%d.%d.%d",
                        ip and 0xff,
                        ip shr 8 and 0xff,
                        ip shr 16 and 0xff,
                        ip shr 24 and 0xff
                    )
                }
            }

            // Fallback: check all network interfaces
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val intf = interfaces.nextElement()
                val addrs = intf.inetAddresses
                while (addrs.hasMoreElements()) {
                    val addr = addrs.nextElement()
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        val host = addr.hostAddress ?: ""
                        if (host.startsWith("192.") || host.startsWith("10.") || host.startsWith("172.")) {
                            return host
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to resolve IP: ${e.message}")
        }
        return "192.168.8.100"
    }

    fun getBatteryPercentage(context: Context): Int {
        return try {
            val batteryStatus: Intent? = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            if (level >= 0 && scale > 0) {
                (level * 100 / scale.toFloat()).toInt()
            } else {
                val bm = context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
                bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 80
            }
        } catch (e: Exception) {
            80
        }
    }

    fun sendCallEvent(context: Context, event: String, callerNumber: String, callType: String) {
        executor.execute {
            try {
                val serverBase = getServerUrl(context)
                val targetUrl = "$serverBase/api/calls/event"
                val uuid = getDeviceUuid(context)
                val ip = getLocalIpAddress(context)
                val battery = getBatteryPercentage(context)

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("device_name", Build.MANUFACTURER.uppercase() + " " + Build.MODEL)
                    put("sim_number", "+97335078079")
                    put("ip_address", ip)
                    put("battery_level", battery)
                    put("event", event)
                    put("caller_number", callerNumber)
                    put("call_type", callType)
                    put("android_version", "Android " + Build.VERSION.RELEASE)
                }

                val url = URL(targetUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.connectTimeout = 3000
                conn.readTimeout = 5000
                conn.doOutput = true

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                Log.d(TAG, "Sent Call Event: $event ($callerNumber) -> Response Code: $responseCode")
                conn.disconnect()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send call event: ${e.message}")
            }
        }
    }

    fun sendHeartbeat(context: Context, batteryLevel: Int) {
        executor.execute {
            try {
                val serverBase = getServerUrl(context)
                val targetUrl = "$serverBase/api/devices/heartbeat"
                val uuid = getDeviceUuid(context)
                val ip = getLocalIpAddress(context)
                val actualBattery = if (batteryLevel > 0) batteryLevel else getBatteryPercentage(context)

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("device_name", Build.MANUFACTURER.uppercase() + " " + Build.MODEL)
                    put("ip_address", ip)
                    put("battery_level", actualBattery)
                }

                val url = URL(targetUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.connectTimeout = 3000
                conn.readTimeout = 5000
                conn.doOutput = true

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }
                val responseCode = conn.responseCode
                Log.d(TAG, "Heartbeat sent (Battery: $actualBattery%, IP: $ip) -> Response: $responseCode")
                conn.disconnect()
            } catch (e: Exception) {
                Log.w(TAG, "Heartbeat failed: ${e.message}")
            }
        }
    }
}
