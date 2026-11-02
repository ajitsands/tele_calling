# TeleCalling — Call Recording & Central Laptop Server Guide

This document explains how call recording works across all your telecaller smartphones, how files are transferred directly to your laptop, and how phone storage is kept completely clean.

---

## 1. Does All Call Audio Go to My Laptop?

**YES, 100%.** 

Your laptop functions as the central **On-Premise Telephony Server**:
- **Server Address**: `http://192.168.8.11:8000`
- **Recording Storage Path on Your Laptop**:
  👉 `E:\TeleCalling\backend\storage\recordings\`
- **Database Index**: Every recording is tied to the call's timestamp, customer phone number, duration, and the specific telecaller who took the call.
- **In-Browser Playback**: You and your supervisors can listen to any call recording directly by clicking the **Play ▶** button under the **Call Logs & Audio** tab in the web portal (`http://192.168.8.11:3000`).

---

## 2. Automatic Phone Storage Cleanup (Auto-Delete)

To prevent smartphones from running out of disk space:
1. When a call concludes, the phone saves the audio locally.
2. The **TeleCalling Gateway** companion app detects the file and uploads it to your laptop server.
3. Once your laptop confirms the upload (**HTTP 200 OK**), the app **automatically deletes the audio file from the phone's storage**.
4. Result: **Zero phone storage clutter** — telecallers can take hundreds of calls every day without their phone memory ever filling up!

---

## 3. How to Enable Auto Call Recording on Smartphones

Different Android phone brands have native recording options in their default Phone app:

### A. OPPO / OnePlus / Google Phone Dialer (Your Phone)
1. Open the default **Phone / Dialer** app.
2. Tap the **3 dots ⋮ (Settings)** in the top right corner.
3. Select **Call Recording**.
4. Under **Automatic call recording**:
   - Turn **ON** 👉 **"Automatically record unknown numbers"**.
   - Tap **"Automatically record these numbers"** -> Turn ON **"Always record selected numbers"** (add any saved company contacts).

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
| **1. Server Running** | `run_backend.bat` active on laptop | Console shows `PHP Development Server (http://0.0.0.0:8000) started` |
| **2. Phone Connected** | In TeleCalling Gateway app, URL is `http://192.168.8.11:8000` | Tap "CONNECT & START SERVICE" -> shows connected |
| **3. Make a Call** | Place or receive a call on the phone | Phone screen shows recording active; Laptop shows incoming call popup |
| **4. Hang Up** | Conclude the call | Within 5 seconds, audio is uploaded to `E:\TeleCalling\backend\storage\recordings\` and deleted from phone |
| **5. Play Audio** | Open `http://192.168.8.11:3000` -> **Call Logs & Audio** | Click **Play ▶** button to listen to the recording |

