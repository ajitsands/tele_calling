package com.telecalling.companion

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
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
    private val mainHandler = Handler(Looper.getMainLooper())

    fun getServerUrl(context: Context): String {
        val prefs = context.getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
        return prefs.getString("server_url", "http://192.168.100.4:8000") ?: "http://192.168.100.4:8000"
    }

    fun getSimNumber(context: Context): String {
        val prefs = context.getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
        return prefs.getString("sim_number", "+97336533695") ?: "+97336533695"
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
        return "192.168.100.1"
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

    fun sendCallEvent(
        context: Context,
        event: String,
        callerNumber: String,
        callType: String,
        callback: ((Boolean, Int, String) -> Unit)? = null
    ) {
        executor.execute {
            var conn: HttpURLConnection? = null
            try {
                val serverBase = getServerUrl(context).trimEnd('/')
                val targetUrl = "$serverBase/api/calls/event"
                val uuid = getDeviceUuid(context)
                val ip = getLocalIpAddress(context)
                val battery = getBatteryPercentage(context)
                val simNumber = getSimNumber(context)

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("device_name", Build.MANUFACTURER.uppercase() + " " + Build.MODEL)
                    put("sim_number", simNumber)
                    put("ip_address", ip)
                    put("battery_level", battery)
                    put("event", event)
                    put("caller_number", callerNumber)
                    put("call_type", callType)
                    put("android_version", "Android " + Build.VERSION.RELEASE)
                }

                val url = URL(targetUrl)
                conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.connectTimeout = 4000
                conn.readTimeout = 6000
                conn.doOutput = true

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                Log.d(TAG, "Sent Call Event: $event ($callerNumber) -> Response Code: $responseCode")

                val success = responseCode in 200..299
                val msg = if (success) "Event $event dispatched successfully (HTTP $responseCode)" else "Server returned HTTP $responseCode"
                if (callback != null) {
                    mainHandler.post { callback(success, responseCode, msg) }
                }
            } catch (e: Exception) {
                val errMsg = "Connection Failed: ${e.javaClass.simpleName} - ${e.message}"
                Log.e(TAG, "Failed to send call event: $errMsg")
                if (callback != null) {
                    mainHandler.post { callback(false, -1, errMsg) }
                }
            } finally {
                conn?.disconnect()
            }
        }
    }

    fun sendHeartbeat(
        context: Context,
        batteryLevel: Int,
        callback: ((Boolean, Int, String) -> Unit)? = null
    ) {
        executor.execute {
            var conn: HttpURLConnection? = null
            try {
                val serverBase = getServerUrl(context).trimEnd('/')
                val targetUrl = "$serverBase/api/devices/heartbeat"
                val uuid = getDeviceUuid(context)
                val ip = getLocalIpAddress(context)
                val actualBattery = if (batteryLevel > 0) batteryLevel else getBatteryPercentage(context)
                val simNumber = getSimNumber(context)

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("device_name", Build.MANUFACTURER.uppercase() + " " + Build.MODEL)
                    put("sim_number", simNumber)
                    put("ip_address", ip)
                    put("battery_level", actualBattery)
                    put("android_version", "Android " + Build.VERSION.RELEASE)
                }

                val url = URL(targetUrl)
                conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.connectTimeout = 4000
                conn.readTimeout = 6000
                conn.doOutput = true

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }

                val responseCode = conn.responseCode
                Log.d(TAG, "Heartbeat sent (Battery: $actualBattery%, IP: $ip) -> Response: $responseCode")

                val success = responseCode in 200..299
                val msg = if (success) "Heartbeat connected! (HTTP $responseCode)" else "Heartbeat rejected: HTTP $responseCode"
                if (callback != null) {
                    mainHandler.post { callback(success, responseCode, msg) }
                }
            } catch (e: Exception) {
                val errMsg = "Heartbeat Failed: ${e.javaClass.simpleName} - ${e.message}"
                Log.w(TAG, errMsg)
                if (callback != null) {
                    mainHandler.post { callback(false, -1, errMsg) }
                }
            } finally {
                conn?.disconnect()
            }
        }
    }
}
