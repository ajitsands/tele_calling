package com.telecalling.companion

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
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

    companion object {
        private const val TAG = "MainActivity"
        private const val PERMISSION_REQUEST_CODE = 101
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            setContentView(R.layout.activity_main)

            val txtDeviceUuid = findViewById<TextView>(R.id.txtDeviceUuid)
            val edtServerUrl = findViewById<EditText>(R.id.edtServerUrl)
            val edtSimNumber = findViewById<EditText>(R.id.edtSimNumber)
            val btnSaveUrl = findViewById<Button>(R.id.btnSaveUrl)
            val btnTestCall = findViewById<Button>(R.id.btnTestCall)
            val txtStatusFeedback = findViewById<TextView>(R.id.txtStatusFeedback)

            val prefs = getSharedPreferences("telecalling_prefs", Context.MODE_PRIVATE)
            val currentServer = prefs.getString("server_url", "http://192.168.100.4:8000") ?: "http://192.168.100.4:8000"
            val currentSim = prefs.getString("sim_number", "+97336533695") ?: "+97336533695"
            edtServerUrl.setText(currentServer)
            edtSimNumber.setText(currentSim)

            val uuid = NetworkManager.getDeviceUuid(this)
            txtDeviceUuid.text = "Device ID: $uuid\nDevice: ${Build.MANUFACTURER} ${Build.MODEL}\nAndroid: ${Build.VERSION.RELEASE}"

            btnSaveUrl.setOnClickListener {
                val url = edtServerUrl.text.toString().trim().trimEnd('/')
                val sim = edtSimNumber.text.toString().trim()
                if (url.isEmpty()) {
                    Toast.makeText(this, "Please enter Server URL", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                prefs.edit().putString("server_url", url).putString("sim_number", sim).apply()
                val battery = NetworkManager.getBatteryPercentage(this)
                val ip = NetworkManager.getLocalIpAddress(this)

                txtStatusFeedback.text = "Testing connection to $url..."
                txtStatusFeedback.setBackgroundColor(Color.parseColor("#FEF08A")) // yellow
                txtStatusFeedback.setTextColor(Color.parseColor("#854D0E"))

                NetworkManager.sendHeartbeat(this, battery) { success, code, msg ->
                    if (success) {
                        txtStatusFeedback.text = "CONNECTED! Server online (HTTP $code)\nDevice IP: $ip | Battery: $battery%\nSIM: $sim"
                        txtStatusFeedback.setBackgroundColor(Color.parseColor("#DCFCE7")) // green
                        txtStatusFeedback.setTextColor(Color.parseColor("#166534"))
                        Toast.makeText(this, "Connected successfully to Server!", Toast.LENGTH_SHORT).show()
                        TelephonyTrackingService.start(this)
                    } else {
                        txtStatusFeedback.text = "FAILED TO CONNECT: $msg\n\nEnsure phone is on same Wi-Fi and URL uses port :8000 (e.g. $url)"
                        txtStatusFeedback.setBackgroundColor(Color.parseColor("#FEE2E2")) // red
                        txtStatusFeedback.setTextColor(Color.parseColor("#991B1B"))
                        Toast.makeText(this, "Connection failed: $msg", Toast.LENGTH_LONG).show()
                    }
                }
            }

            btnTestCall.setOnClickListener {
                val url = edtServerUrl.text.toString().trim().trimEnd('/')
                val sim = edtSimNumber.text.toString().trim()
                if (url.isNotEmpty()) {
                    prefs.edit().putString("server_url", url).putString("sim_number", sim).apply()
                }

                txtStatusFeedback.text = "Sending test incoming call event..."
                txtStatusFeedback.setBackgroundColor(Color.parseColor("#FEF08A"))
                txtStatusFeedback.setTextColor(Color.parseColor("#854D0E"))

                NetworkManager.sendCallEvent(this, "RINGING", "+919876543210", "INCOMING") { success, code, msg ->
                    if (success) {
                        txtStatusFeedback.text = "SUCCESS! Test Incoming Call Event received by Server (HTTP $code).\nCheck computer screen for popup!"
                        txtStatusFeedback.setBackgroundColor(Color.parseColor("#DCFCE7"))
                        txtStatusFeedback.setTextColor(Color.parseColor("#166534"))
                        Toast.makeText(this, "Incoming Call Popup sent to Server!", Toast.LENGTH_SHORT).show()
                    } else {
                        txtStatusFeedback.text = "CALL EVENT FAILED: $msg\n\nEnsure server URL is reachable at $url"
                        txtStatusFeedback.setBackgroundColor(Color.parseColor("#FEE2E2"))
                        txtStatusFeedback.setTextColor(Color.parseColor("#991B1B"))
                        Toast.makeText(this, "Failed to send: $msg", Toast.LENGTH_LONG).show()
                    }
                }
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
            TelephonyTrackingService.start(this)
        }
    }
}
