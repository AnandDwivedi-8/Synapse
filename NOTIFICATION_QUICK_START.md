# Notification System - Quick Start

## ✅ Status
Notification system for likes, comments, follows, and messages is **FULLY IMPLEMENTED**.

Both servers are currently running:
- ✅ Backend: http://localhost:4000
- ✅ Frontend: http://localhost:5173

---

## 🧪 Test in 3 Minutes

### Step 1: Open Two Browsers
- **Browser 1**: http://localhost:5173 → Login with `an@gmail.com`
- **Browser 2**: Open in **PRIVATE window** → Login with `john@gmail.com` / `password123`

### Step 2: Test Like Notification
1. In **Browser 2**: Find a post by "root" user
2. Click the heart ❤️ to like it
3. In **Browser 1**:
   - Check console (F12) for `[Socket]` logs
   - Notifications page should show the like with red heart icon
   - Sidebar should show red dot on Notifications

### Step 3: Test Comment
1. In **Browser 2**: Add a comment on root's post
2. In **Browser 1**: Check Notifications page for comment with chat bubble icon

### Step 4: Test Follow
1. In **Browser 2**: Go to root's profile and click Follow
2. In **Browser 1**: Check Notifications page for follow with user+ icon

---

## 📱 What You Should See

### Notifications Page
- Red heart ❤️ for likes
- Blue comment bubble 💬 for comments  
- Green user+ 👤 for follows
- Each shows username and action
- Can click to view post/profile
- Can delete individual or clear all

### Sidebar
- Red dot appears on Notifications icon when notifications exist
- Badge shows count (1, 2, 3...)
- Click to navigate to Notifications page

---

## 🔍 Debugging Checklist

If notifications don't work:

- [ ] Check **Backend Terminal** for `[LIKE POST]` logs
- [ ] Check **Browser 1 Console (F12)** for `[Socket]` logs
- [ ] Make sure **Browser 2 user is different** from Browser 1
- [ ] Refresh both browsers: `Ctrl+Shift+R`
- [ ] Check both users are **logged in and connected**

---

## 📚 Full Documentation

- See `NOTIFICATION_SYSTEM_COMPLETE.md` for full implementation details
- See `NOTIFICATION_TESTING.md` for detailed test scenarios

---

## 🎯 How to Restart Servers

```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Start Backend
START_BACKEND.bat

# Start Frontend (in another terminal)
cd frontend
npm run dev
```

---

**Everything is ready to test! 🚀**
