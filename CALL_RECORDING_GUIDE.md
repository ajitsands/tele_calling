# TeleCalling — Call Recording & Central Server Guide

This document explains how call recording works across all your telecaller smartphones, how audio files are transferred directly to your **Central Telephony Server**, and how phone storage is kept completely clean.

---

## 1. Does All Call Audio Go to the Server?

**YES, 100%.** 

The system functions with a centralized **Dedicated Telephony Server**:
- **Server Address**: `http://192.168.8.11:8000` (or your production Server IP / Domain)
- **Specified Server Recording Storage Folder Path**:
  👉 `backend/storage/recordings/` *(Configurable in `backend/config/config.php`)*
- **Database Indexing**: Every recording is tied in the database to the call's timestamp, customer phone number, duration, and the specific telecaller who handled the call.
- **In-Browser Playback**: Telecallers and supervisors can stream or listen to any call recording directly by clicking the **Play ▶** button under the **Call Logs & Audio** tab in the web portal (`http://192.168.8.11:3000`).

---

## 2. Automatic Phone Storage Cleanup (Auto-Delete)

To prevent smartphones from running out of disk space:
1. When a call concludes, the phone saves the audio locally in its native recorder folder.
2. The **TeleCalling Gateway** companion app detects the file and streams it to your Server endpoint (`/api/recordings/upload`).
3. Once the Server verifies and safely stores the file (**HTTP 200 OK**), the companion app **automatically deletes the audio file from the phone's storage**.
4. Result: **Zero phone storage clutter** — telecallers can take hundreds of calls every day without their mobile memory ever filling up!

---

## 3. How to Enable Auto Call Recording on Smartphones

Different Android phone brands have native recording options in their default Phone app:

### A. OPPO & OnePlus (ColorOS / OxygenOS / Google Phone)
1. Open the default **Phone / Dialer** app.
2. Tap the **3 dots ⋮ (Settings)** in the top right corner.
3. Select **Call Recording**.
4. Under **Automatic call recording**:
   - Turn **ON** 👉 **"Automatically record unknown numbers"**.
   - Tap **"Automatically record these numbers"** -> Turn ON **"Always record selected numbers"** (add company contacts).

### B. Samsung Galaxy (One UI)
1. Open the **Phone** app.
2. Tap the **3 dots ⋮** > **Settings**.
3. Tap **Record calls**.
4. Turn **ON** 👉 **"Auto record calls"** (Select *All calls*).

### C. Xiaomi / Redmi (MIUI / HyperOS)
1. Open the **Phone / Dialer** app.
2. Tap the **Settings icon ⚙️** (top right).
3. Tap **Call recording**.
4. Turn **ON** 👉 **"Record calls automatically"** (Select *All numbers*).

### D. Vivo / iQOO (Funtouch OS)
1. Open **Settings > Phone > Call settings > Record settings**.
2. Select 👉 **"Record all calls automatically"**.

---

## 4. Verification Checklist

| Step | Action | Expected Result |
|---|---|---|
| **1. Server Running** | `run_backend.bat` active on Server | Console shows `PHP Development Server (http://0.0.0.0:8000) started` |
| **2. Phone Connected** | In TeleCalling Gateway app, URL is Server address `http://192.168.8.11:8000` | Tap "CONNECT & START SERVICE" -> shows connected |
| **3. Make a Call** | Place or receive a call on the phone | Phone screen shows recording active; Server web portal shows incoming call popup |
| **4. Hang Up** | Conclude the call | Within 5 seconds, audio is saved to Server storage folder `backend/storage/recordings/` and deleted from phone |
| **5. Play Audio** | Open `http://192.168.8.11:3000` -> **Call Logs & Audio** | Click **Play ▶** button to listen to the recording |
