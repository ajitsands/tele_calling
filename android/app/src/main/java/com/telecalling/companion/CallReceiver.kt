package com.telecalling.companion

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log

class CallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "TeleCallingReceiver"
        private var lastState = TelephonyManager.CALL_STATE_IDLE
        private var savedNumber: String? = null
        private var isIncoming = false
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_NEW_OUTGOING_CALL) {
            savedNumber = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER)
            isIncoming = false
            return
        }

        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            var state = TelephonyManager.CALL_STATE_IDLE
            if (stateStr == TelephonyManager.EXTRA_STATE_RINGING) {
                state = TelephonyManager.CALL_STATE_RINGING
            } else if (stateStr == TelephonyManager.EXTRA_STATE_OFFHOOK) {
                state = TelephonyManager.CALL_STATE_OFFHOOK
            }

            onCallStateChanged(context, state, incomingNumber ?: savedNumber)
        }
    }

    private fun onCallStateChanged(context: Context, state: Int, number: String?) {
        if (lastState == state) {
            return
        }

        val formattedNumber = number ?: "Unknown"

        when (state) {
            TelephonyManager.CALL_STATE_RINGING -> {
                isIncoming = true
                savedNumber = formattedNumber
                Log.i(TAG, "Incoming Ringing from: $formattedNumber")
                NetworkManager.sendCallEvent(
                    context = context,
                    event = "RINGING",
                    callerNumber = formattedNumber,
                    callType = "INCOMING"
                )
            }
            TelephonyManager.CALL_STATE_OFFHOOK -> {
                if (isIncoming) {
                    Log.i(TAG, "Incoming Call Answered: $savedNumber")
                    NetworkManager.sendCallEvent(
                        context = context,
                        event = "ANSWERED",
                        callerNumber = savedNumber ?: "Unknown",
                        callType = "INCOMING"
                    )
                } else {
                    Log.i(TAG, "Outgoing Call Started: $savedNumber")
                    NetworkManager.sendCallEvent(
                        context = context,
                        event = "RINGING",
                        callerNumber = savedNumber ?: "Unknown",
                        callType = "OUTGOING"
                    )
                }
            }
            TelephonyManager.CALL_STATE_IDLE -> {
                if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                    Log.i(TAG, "Missed Call: $savedNumber")
                    NetworkManager.sendCallEvent(
                        context = context,
                        event = "MISSED",
                        callerNumber = savedNumber ?: "Unknown",
                        callType = if (isIncoming) "INCOMING" else "OUTGOING"
                    )
                } else {
                    Log.i(TAG, "Call Ended: $savedNumber")
                    NetworkManager.sendCallEvent(
                        context = context,
                        event = "ENDED",
                        callerNumber = savedNumber ?: "Unknown",
                        callType = if (isIncoming) "INCOMING" else "OUTGOING"
                    )

                    // Trigger recording search and upload post-call
                    RecordingSyncService.triggerRecordingSync(context, savedNumber ?: "")
                }
                isIncoming = false
                savedNumber = null
            }
        }
        lastState = state
    }
}

