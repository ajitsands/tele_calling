package com.telecalling.companion

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 200
    private val TAG = "TeleCallingMain"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Prevent silent crash by catching uncaught exceptions gracefully
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "Uncaught exception in $thread", throwable)
        }

        try {
            setContentView(R.layout.activity_main)

            val txtDeviceUuid = findViewById<TextView>(R.id.txtDeviceUuid)
            val edtServerUrl = findViewById<EditText>(R.id.edtServerUrl)
            val btnSaveUrl = findViewById<Button>(R.id.btnSaveUrl)
            val btnTestCall = findViewById<Button>(R.id.btnTestCall)

            val prefs = getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
            val currentServer = prefs.getString("server_url", "http://192.168.1.100:8000")
            edtServerUrl.setText(currentServer)

            val uuid = NetworkManager.getDeviceUuid(this)
            txtDeviceUuid.text = "Device ID: $uuid\nDevice: ${Build.MANUFACTURER} ${Build.MODEL}\nAndroid: ${Build.VERSION.RELEASE}"

            btnSaveUrl.setOnClickListener {
                val url = edtServerUrl.text.toString().trim()
                if (url.isNotEmpty()) {
                    prefs.edit().putString("server_url", url).apply()
                    Toast.makeText(this, "Server URL saved! Starting Gateway Service...", Toast.LENGTH_SHORT).show()
                    TelephonyTrackingService.start(this)
                }
            }

            btnTestCall.setOnClickListener {
                val url = edtServerUrl.text.toString().trim()
                if (url.isNotEmpty()) {
                    prefs.edit().putString("server_url", url).apply()
                }
                NetworkManager.sendCallEvent(this, "RINGING", "+919876543210", "INCOMING")
                Toast.makeText(this, "Dispatched test incoming call to server!", Toast.LENGTH_SHORT).show()
            }

            // Check permissions first
            checkAndRequestPermissions()

        } catch (e: Throwable) {
            Log.e(TAG, "Error in onCreate", e)
            Toast.makeText(this, "Startup error: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO)
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), PERMISSION_REQUEST_CODE)
        } else {
            // All permissions already granted, start service safely
            TelephonyTrackingService.start(this)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val allGranted = grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (allGranted) {
                Toast.makeText(this, "All permissions granted! Service active.", Toast.LENGTH_SHORT).show()
            }
            // Safely start service after permission dialog closes
            TelephonyTrackingService.start(this)
        }
    }
}
