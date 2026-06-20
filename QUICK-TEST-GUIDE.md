# Quick Test Guide - Fix 404 Error

## ✅ Server Status
The server is **running** on port 8000.

## 🔗 Correct URLs to Access

### Option 1: Main Application
**http://localhost:8000/index.html**

### Option 2: Directory Listing
**http://localhost:8000/**

This will show all files. Click on `index.html` to open the application.

---

## 🐛 Troubleshooting 404 Error

### If you see 404, try these:

1. **Use the exact URL:**
   ```
   http://localhost:8000/index.html
   ```
   (Note: include `/index.html` at the end)

2. **Check if you're using the right port:**
   - Should be port **8000**
   - Not 8080, 3000, or any other port

3. **Try accessing the directory first:**
   ```
   http://localhost:8000/
   ```
   This should show a file listing. Then click on `index.html`.

4. **Clear browser cache:**
   - Press `Ctrl + Shift + R` (hard refresh)
   - Or `Ctrl + F5`

5. **Try a different browser:**
   - Chrome, Firefox, Edge

---

## 🚀 Alternative: Open File Directly

If the server isn't working, you can also:
1. Navigate to the project folder
2. Double-click `index.html`
3. It will open in your default browser

**Note:** Some features might not work when opening directly (file:// protocol) due to CORS restrictions. The server method is recommended.

---

## ✅ Quick Verification

1. Open browser
2. Go to: **http://localhost:8000/**
3. You should see a directory listing with files
4. Click on `index.html`
5. The application should load

---

## 📝 Test Payload (Once Application Loads)

- **Crop**: Paddy lowland
- **Organic Carbon**: 0.4
- **Nitrogen**: 150 kg/acre
- **Phosphorus**: 9 kg/acre
- **Potassium**: 70 kg/acre
- **Season**: Rabi
- **Location**: SOUTH TELENGANA

Then click "Get Recommendation" to see the new enhancements!







