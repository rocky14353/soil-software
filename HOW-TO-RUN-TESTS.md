# How to Run the Test File

## ✅ **Method 1: Open File Directly (Easiest)**

1. **Navigate to your folder:**
   - Go to: `C:\Users\penum\OneDrive\Desktop\Soil Software`

2. **Double-click the file:**
   - Find `test-exceptions-simple.html`
   - Double-click it
   - It will open in your default browser

3. **Click the button:**
   - Click "Run All Tests" button
   - View results

---

## ✅ **Method 2: Use the Server Script**

1. **Open PowerShell in the folder:**
   - Right-click in the folder
   - Select "Open in Terminal" or "Open PowerShell window here"

2. **Run the server:**
   ```powershell
   .\start-server.ps1
   ```
   OR double-click `start-server.bat`

3. **Open in browser:**
   - Go to: `http://localhost:8000/test-exceptions-simple.html`
   - Click "Run All Tests"

---

## ✅ **Method 3: Manual Server Start**

1. **Open Command Prompt or PowerShell:**
   ```powershell
   cd "C:\Users\penum\OneDrive\Desktop\Soil Software"
   python -m http.server 8000
   ```

2. **Open browser:**
   - Go to: `http://localhost:8000/test-exceptions-simple.html`

---

## ⚠️ **If File Won't Open:**

### **Check:**
1. ✅ File exists: `test-exceptions-simple.html` should be in the folder
2. ✅ `script.js` is in the same folder (required)
3. ✅ Browser allows local files (some browsers block this)

### **Solution:**
- Use Method 2 or 3 (server method) - this always works
- Or right-click the file → "Open with" → Choose your browser

---

## 📝 **Quick Test:**

**Try this first:**
1. Go to: `C:\Users\penum\OneDrive\Desktop\Soil Software`
2. Double-click: `test-exceptions-simple.html`
3. If it opens → Click "Run All Tests"
4. If it doesn't open → Use the server method (Method 2)

---

## 🎯 **Expected Result:**

After clicking "Run All Tests", you should see:
- Test Results summary
- 5 test cases with ✅ or ❌
- Details for each test
- Full results (expandable)











