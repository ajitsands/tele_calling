package com.telecalling.companion

import android.content.Context
import android.os.Environment
import android.util.Log
import java.io.DataOutputStream
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object RecordingSyncService {
    private const val TAG = "RecordingSync"
    private val executor = Executors.newSingleThreadExecutor()

    // Common phone call recording paths across Samsung, Xiaomi/MIUI, OnePlus, Oppo, Vivo, Google Dialer
    private val RECORDING_DIRECTORIES = listOf(
        "Recordings/Call",
        "Recordings",
        "CallRecordings",
        "Music/Recordings/Call",
        "Music/Recordings",
        "Sounds/CallRecordings",
        "Sounds",
        "ColorOS/CallRecordings",
        "PhoneRecordings",
        "MIUI/sound_recorder/call_rec",
        "Download"
    )

    fun triggerRecordingSync(context: Context, callerNumber: String) {
        executor.execute {
            try {
                // Wait 4-5 seconds for phone OS to finish encoding and writing the audio file
                Thread.sleep(4000)

                val storage = Environment.getExternalStorageDirectory()
                var latestFile: File? = null
                var latestTime = 0L

                for (dirName in RECORDING_DIRECTORIES) {
                    val folder = File(storage, dirName)
                    if (folder.exists() && folder.isDirectory) {
                        folder.listFiles()?.forEach { file ->
                            if (file.isFile && (file.extension.equals("mp3", true) ||
                                        file.extension.equals("m4a", true) ||
                                        file.extension.equals("wav", true) ||
                                        file.extension.equals("amr", true))) {
                                if (file.lastModified() > latestTime) {
                                    latestTime = file.lastModified()
                                    latestFile = file
                                }
                            }
                        }
                    }
                }

                // If a recording file was created in the last 2 minutes, upload it
                if (latestFile != null && (System.currentTimeMillis() - latestTime < 120_000)) {
                    Log.i(TAG, "Found recent call recording: ${latestFile!!.name}. Uploading to server...")
                    uploadRecording(context, latestFile!!, callerNumber)
                } else {
                    Log.d(TAG, "No recent recording file found in standard folders.")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Recording sync error: ${e.message}")
            }
        }
    }

    private fun uploadRecording(context: Context, file: File, callerNumber: String) {
        val serverBase = NetworkManager.getServerUrl(context)
        val uploadUrl = "$serverBase/api/recordings/upload"
        val boundary = "===Boundary" + System.currentTimeMillis() + "==="
        val lineEnd = "\r\n"
        val twoHyphens = "--"

        try {
            val url = URL(uploadUrl)
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            conn.connectTimeout = 10000
            conn.readTimeout = 30000
            conn.doOutput = true

            DataOutputStream(conn.outputStream).use { output ->
                // Field: caller_number
                output.writeBytes(twoHyphens + boundary + lineEnd)
                output.writeBytes("Content-Disposition: form-data; name=\"caller_number\"$lineEnd$lineEnd")
                output.writeBytes(callerNumber + lineEnd)

                // Field: audio
                output.writeBytes(twoHyphens + boundary + lineEnd)
                output.writeBytes("Content-Disposition: form-data; name=\"audio\"; filename=\"${file.name}\"$lineEnd")
                output.writeBytes("Content-Type: audio/mpeg$lineEnd$lineEnd")

                FileInputStream(file).use { input ->
                    val buffer = ByteArray(4096)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                    }
                }
                output.writeBytes(lineEnd)
                output.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd)
                output.flush()
            }

            val responseCode = conn.responseCode
            Log.i(TAG, "Recording upload response code: $responseCode")
            conn.disconnect()

            // If upload succeeded (200 OK), delete local audio from phone to prevent memory fill-up
            if (responseCode in 200..299) {
                try {
                    val deleted = file.delete()
                    Log.i(TAG, "Recording uploaded to Server. Local audio deleted to save phone storage: $deleted (${file.name})")
                } catch (delErr: Exception) {
                    Log.w(TAG, "Could not delete local file: ${delErr.message}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to upload recording: ${e.message}")
        }
    }
}

