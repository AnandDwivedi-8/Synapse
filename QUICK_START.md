# ⚡ QUICK START - Copy & Paste Commands

## 🚀 Fastest Way to Restart

### Step 1: Start MongoDB (if not running)
```powershell
mongod
```

### Step 2: Terminal 1 - Backend
```powershell
cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\backend"
node index.js
```

### Step 3: Terminal 2 - Frontend
```powershell
cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\frontend"
node node_modules/vite/bin/vite.js
```

### Step 4: Open Browser
```
http://localhost:5173
```

### Step 5: Login
Use any test user from TEST_USERS.md:
- Username: `john_doe`
- Password: `password123`

---

## 📋 What to Expect

✅ **Backend Terminal** should show:
```
Server listen at port 4000
mongodb connected successfully.
```

✅ **Frontend Terminal** should show:
```
VITE v7.2.6  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

✅ **Browser** should load with:
- Login page (if not logged in)
- Home feed (if logged in)
- No red errors in console

---

## 🔧 If Something's Wrong

| Error | Fix |
|-------|-----|
| Port 4000 in use | `taskkill /F /IM node.exe` then restart |
| MongoDB won't connect | Make sure `mongod` is running |
| VITE error | `cd frontend` then `npm install` then retry |
| Can't login | Clear cookies (DevTools → Application → Cookies → Delete) |
| Module not found | `npm install` in the folder with error |

---

## 📁 Files You Created/Modified

```
instaclone-main/
├── SETUP_AND_RUN_GUIDE.md      ← START HERE
├── TEST_USERS.md               ← Test credentials
├── START_BACKEND.bat           ← Double-click to start
├── START_FRONTEND.bat          ← Double-click to start
├── backend/
│   └── .env                    ← Environment variables
└── frontend/
    └── src/
```

---

## 🎯 One-Time Setup (First Launch Only)

```powershell
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies  
cd ..\frontend
npm install

# 3. Create .env in backend folder (if not exist)
# See SETUP_AND_RUN_GUIDE.md for contents

# 4. Create test users
cd ..\backend
node create-test-users.js
```

---

## 📌 Important Paths

- **Backend folder**: `d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\backend`
- **Frontend folder**: `d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\frontend`
- **Backend URL**: http://localhost:4000/api/v1
- **Frontend URL**: http://localhost:5173
- **MongoDB**: mongodb://localhost:27017/synapse

---

## 🆘 Emergency - Reset Everything

If nothing works:

```powershell
# Kill everything
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe

# Wait a moment
Start-Sleep -Seconds 2

# Start fresh
mongod          # Terminal 1
# Wait for "waiting for connections"

cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\backend"
node index.js   # Terminal 2

cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\frontend"
node node_modules/vite/bin/vite.js  # Terminal 3

# Open browser
Start-Process "http://localhost:5173"
```

---

## 📞 Support

- **Setup Issues?** → Read `SETUP_AND_RUN_GUIDE.md`
- **Login Credentials?** → See `TEST_USERS.md`
- **Error Messages?** → Check browser console (F12) and backend terminal
- **Port Conflicts?** → See troubleshooting section above

---

**Created**: December 6, 2025
