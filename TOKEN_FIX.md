# 🔧 TOKEN VERIFICATION FAILED - FIX

## Problem
Backend returning: `Token verification failed`

## Root Causes
1. ✅ Token was created with different SECRET_KEY
2. ✅ Stale token in browser localStorage
3. ⚠️ Browser caching old session

## Quick Fix (30 seconds)

### Option 1: Clear Browser Storage (EASIEST)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste and run:
```javascript
localStorage.clear();
sessionStorage.clear();
```
4. **RELOAD PAGE** (Ctrl+R)
5. Sign Up again with new account
6. Try creating post

### Option 2: Clear Browser Cache
1. Press **Ctrl+Shift+Delete**
2. Select "Cookies and other site data"
3. Click "Clear data"
4. Close and reopen browser

### Option 3: Incognito/Private Window
1. Press **Ctrl+Shift+N** (or Cmd+Shift+N on Mac)
2. Open http://localhost:5173
3. Sign up fresh
4. Test features

---

## Verify Fix

After clearing storage:
1. Go to http://localhost:5173
2. Sign up with new account
3. Try to create a post
4. If it works, token issue is fixed!

---

## What's Happening

1. **Old Token:** You logged in before SECRET_KEY was set properly
2. **Token Mismatch:** Token was signed with wrong key, verification fails
3. **Cache:** Browser still trying to use old token
4. **Solution:** Clear old token, sign up fresh, new token will use correct SECRET_KEY

---

## Test After Fix

1. ✅ Sign up works
2. ✅ Create post works (no auth error)
3. ✅ Like post works
4. ✅ Comment works
5. ✅ Follow works
6. ✅ Send message works

If all these work → Token issue is RESOLVED ✅

---

## Still Not Working?

Check backend console for errors:
- Should say: "mongodb connected successfully"
- Should say: "Server listen at port 4000"
- No red errors

If backend restarted and still failing:
1. Kill all terminals
2. Start backend fresh
3. Start frontend fresh
4. Clear browser storage
5. Try again
