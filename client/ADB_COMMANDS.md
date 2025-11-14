# ADB Debugging Commands for AAS Tracker

## ADB Location
C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe

## Quick Commands

### Check Connected Devices
```powershell
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

### View Filtered Crash Logs
```powershell
# Clear old logs first
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -c

# Watch for crashes (open app after running this)
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat | Select-String -Pattern "expo|ReactNative|AndroidRuntime|FATAL|crash|Error|Exception" -Context 0,3
```

### Save Logs to File
```powershell
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat > crash_logs.txt
```

### View All Logs (Unfiltered)
```powershell
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat
```

### Install APK via ADB
```powershell
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" install path/to/your-app.apk
```

### Uninstall App
```powershell
& "C:\Users\Abhay Vishwakarma\AppData\Local\Android\Sdk\platform-tools\adb.exe" uninstall com.abhayofc.asstrackerknit
```

## Issue Found & Fixed

### Problem:
```
FATAL EXCEPTION: couldn't find DSO to load: libreact_featureflagsjni.so
```

### Cause:
`app.json` had `"newArchEnabled": false` which conflicted with EAS Build's default settings.

### Solution:
Removed `"newArchEnabled": false` from app.json

## Device Info
- Connected Device: ZY22GLJ8CM
- Package Name: com.abhayofc.asstrackerknit
