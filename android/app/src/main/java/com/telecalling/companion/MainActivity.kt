package com.telecalling.companion

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 200

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
                Toast.makeText(this, "Server URL saved", Toast.LENGTH_SHORT).show()
                TelephonyTrackingService.start(this)
            }
        }

        btnTestCall.setOnClickListener {
            NetworkManager.sendCallEvent(this, "RINGING", "+919876543210", "INCOMING")
            Toast.makeText(this, "Sent test RINGING event to server", Toast.LENGTH_SHORT).show()
        }

        checkAndRequestPermissions()
        TelephonyTrackingService.start(this)
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO)
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }
}

