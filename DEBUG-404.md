# Debugging 404 Error

## Quick Diagnostic Steps

1. **Open Browser Console** (Press F12)
2. **Check the Network Tab** - Look for files showing 404
3. **Check Console Tab** - Look for error messages

## Common Issues & Solutions

### Issue 1: JSON Files Not Loading
**Symptom**: 404 errors for `data/*.json` files

**Solution**: 
- Make sure you're accessing: `http://localhost:8000/index.html`
- NOT: `file:///C:/Users/.../index.html` (file:// protocol won't work)

### Issue 2: Wrong Base Path
**Symptom**: All files return 404

**Solution**:
- The server must be running from the project root directory
- Verify by accessing: `http://localhost:8000/` - you should see a directory listing

### Issue 3: Server Not Running
**Symptom**: Connection refused or can't connect

**Solution**:
- Restart the server: `python -m http.server 8000`
- Or use: `.\start-server.ps1`

## Test Files

1. **Test Server**: Open `http://localhost:8000/test-server.html`
   - This will test all file paths and show which ones fail

2. **Test Individual Files**:
   - `http://localhost:8000/data/crops.json` - Should show JSON
   - `http://localhost:8000/script.js` - Should show JavaScript
   - `http://localhost:8000/styles.css` - Should show CSS

## Expected Console Output

When index.html loads successfully, you should see in console:
```
[P-First] Recommendations received: X stages
```

If you see errors like:
```
Failed to load resource: the server responded with a status of 404
```

Then check which file is failing and verify it exists.

## Quick Fix

If JSON files are failing:
1. Open browser console (F12)
2. Check Network tab
3. Find the file returning 404
4. Verify it exists in the `data/` folder
5. Try accessing it directly: `http://localhost:8000/data/[filename].json`







