package com.telecalling.companion

import android.content.Context
import android.os.Build
import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object NetworkManager {
    private const val TAG = "NetworkManager"
    private val executor = Executors.newSingleThreadExecutor()

    fun getServerUrl(context: Context): String {
        val prefs = context.getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
        return prefs.getString("server_url", "http://192.168.1.100:8000") ?: "http://192.168.1.100:8000"
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

    fun sendCallEvent(context: Context, event: String, callerNumber: String, callType: String) {
        executor.execute {
            try {
                val serverBase = getServerUrl(context)
                val targetUrl = "$serverBase/api/calls/event"
                val uuid = getDeviceUuid(context)

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("device_name", Build.MANUFACTURER.uppercase() + " " + Build.MODEL)
                    put("sim_number", "+91 98100 00000")
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

                val payload = JSONObject().apply {
                    put("device_uuid", uuid)
                    put("battery_level", batteryLevel)
                }

                val url = URL(targetUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                conn.connectTimeout = 3000
                conn.doOutput = true

                OutputStreamWriter(conn.outputStream).use { writer ->
                    writer.write(payload.toString())
                    writer.flush()
                }
                conn.responseCode
                conn.disconnect()
            } catch (e: Exception) {
                Log.w(TAG, "Heartbeat failed: ${e.message}")
            }
        }
    }
}

