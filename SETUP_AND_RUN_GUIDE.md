# Synapse - Setup & Run Guide

## Quick Start (30 seconds)

If you already have MongoDB running and just need to restart the app:

```powershell
# Terminal 1 - Start Backend
cd backend
node index.js

# Terminal 2 - Start Frontend
cd frontend
node node_modules/vite/bin/vite.js
```

Then open: **http://localhost:5173**

---

## Complete Setup Guide (First Time)

### Prerequisites
- **Node.js** installed (v14+)
- **MongoDB** installed and running
- **Git** (optional)

### Step 1: Install Dependencies

```powershell
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ..\frontend
npm install
```

### Step 2: Create Backend .env File

Create a file named `.env` in the `backend` folder with these contents:

```env
MONGO_URI=mongodb://localhost:27017/synapse
PORT=4000
SECRET_KEY=synapse_super_secret_key_12345_do_not_share
URL=http://localhost:5173
CLOUD_NAME=synapse_cloud
API_KEY=1234567890123456789
API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

### Step 3: Start MongoDB

```powershell
# If MongoDB is installed as a service, it may be auto-running
# Check if it's running on port 27017

# Or manually start MongoDB:
mongod
```

**Verify MongoDB is running:**
```powershell
mongo
```

If it connects, press `Ctrl+C` to exit.

### Step 4: Create Test Users (Optional but Recommended)

```powershell
cd backend
node create-test-users.js
```

This creates 5 test users for messaging testing.

### Step 5: Start Backend & Frontend

**Terminal 1 - Backend:**
```powershell
cd backend
node index.js
```

Expected output:
```
Server listen at port 4000
mongodb connected successfully.
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
node node_modules/vite/bin/vite.js
```

Expected output:
```
VITE v7.2.6  ready in 599 ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Open in Browser

- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/v1

---

## Daily Restart Procedure

### Every Time You Restart:

**1. Make sure MongoDB is running:**
```powershell
# Check if MongoDB is already running on port 27017
# If not, start it with:
mongod
```

**2. Terminal 1 - Start Backend:**
```powershell
cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\backend"
node index.js
```

**3. Terminal 2 - Start Frontend:**
```powershell
cd "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main\frontend"
node node_modules/vite/bin/vite.js
```

**4. Open Browser:**
- Go to http://localhost:5173
- Login with test credentials (see TEST_USERS.md)

---

## Automated Startup Scripts

### Option A: Using Batch Files (Windows)

**File 1: START_BACKEND.bat**
```batch
@echo off
cd backend
node index.js
pause
```

**File 2: START_FRONTEND.bat**
```batch
@echo off
cd frontend
node node_modules/vite/bin/vite.js
pause
```

**Usage**: Double-click both files to start backend and frontend

### Option B: Using PowerShell Script

Create `run-synapse.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "cd backend; node index.js"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "cd frontend; node node_modules/vite/bin/vite.js"

Write-Host "Synapse is starting..."
Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:5173"
```

**Usage**:
```powershell
.\run-synapse.ps1
```

---

## Troubleshooting

### Issue: "EADDRINUSE: address already in use :::4000"
**Solution**: Backend is already running
```powershell
# Kill all node processes
taskkill /F /IM node.exe
# Then start again
```

### Issue: "MongoDB connection failed"
**Solution**: MongoDB not running
```powershell
# Start MongoDB
mongod
```

### Issue: "Cannot find module 'X'"
**Solution**: Install dependencies
```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### Issue: "Token verification failed" 
**Solution**: Clear browser cookies
1. Open DevTools (F12)
2. Go to Application → Cookies → Delete all
3. Go to Local Storage → Delete all
4. Refresh page and login again

### Issue: "VITE plugin resolution failed"
**Solution**: Clear node_modules and reinstall
```powershell
cd frontend
rmdir node_modules -r -Force
npm install
```

---

## Project Structure

```
instaclone-main/
├── backend/
│   ├── .env                          (Create this!)
│   ├── index.js                      (Main backend file)
│   ├── create-test-users.js          (Create test users)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
├── TEST_USERS.md                     (Test credentials)
├── START_BACKEND.bat                 (Quick start)
└── START_FRONTEND.bat                (Quick start)
```

---

## Ports & URLs Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 4000 | http://localhost:4000/api/v1 |
| Frontend | 5173 | http://localhost:5173 |
| MongoDB | 27017 | mongodb://localhost:27017/synapse |

---

## Environment Variables

**Backend `.env` file must contain:**

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/synapse

# Server
PORT=4000
SECRET_KEY=synapse_super_secret_key_12345_do_not_share
URL=http://localhost:5173

# Cloudinary (Optional - can use test values)
CLOUD_NAME=synapse_cloud
API_KEY=1234567890123456789
API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

## Quick Restart Checklist

- [ ] MongoDB is running
- [ ] Backend started on port 4000
- [ ] Frontend started on port 5173
- [ ] Browser shows http://localhost:5173
- [ ] Can login with test user credentials
- [ ] No red errors in browser console

---

## Commands Cheat Sheet

```powershell
# Start MongoDB
mongod

# Create test users
cd backend
node create-test-users.js

# Start backend
cd backend
node index.js

# Start frontend
cd frontend
node node_modules/vite/bin/vite.js

# Kill all node processes
taskkill /F /IM node.exe

# Check if MongoDB is running
mongo --version
```

---

## Common Ports Already in Use?

```powershell
# Find what's using port 4000
netstat -ano | findstr :4000

# Find what's using port 5173
netstat -ano | findstr :5173

# Kill process by PID
taskkill /PID <PID> /F
```

---

## Development Tips

### Hot Reload (Auto-refresh on code changes)
- **Frontend**: Vite automatically hot-reloads ✅
- **Backend**: Need to manually restart `node index.js`

### Debug Backend
Add console.logs to backend files, they'll show in the terminal where backend is running

### Debug Frontend
Use Browser DevTools (F12) → Console tab

### Check Network Requests
Browser DevTools → Network tab

---

## Next Steps After Restart

1. ✅ Verify backend is running (check terminal)
2. ✅ Verify frontend is running (check terminal)
3. ✅ Open http://localhost:5173
4. ✅ Login with test user (see TEST_USERS.md)
5. ✅ Test all features (Posts, Messages, Profile, etc.)

---

## Need Help?

1. Check if MongoDB is running: `mongo`
2. Check if backend is running: Terminal should show "Server listen at port 4000"
3. Check if frontend is running: Terminal should show VITE ready message
4. Check browser console for errors: F12 → Console
5. Check backend terminal for errors: Node process terminal

---

**Last Updated**: December 6, 2025  
**Project**: Synapse (Instagram Clone)  
**Version**: 1.0

Happy coding! 🚀
