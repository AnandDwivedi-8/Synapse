# Notification System Testing Guide

## System Status
✅ **Backend**: Running on http://localhost:4000
✅ **Frontend**: Running on http://localhost:5173
✅ **Socket.io**: Connected and listening for events
✅ **MongoDB**: Connected and synced

---

## Testing Steps

### **Step 1: Prepare Two Browser Windows**

1. **Browser 1 (User A - Root)**
   - Open http://localhost:5173
   - Login with email: `an@gmail.com` (your password)
   - Navigate to `/notifications` to see the notifications page
   - Keep DevTools open (F12 → Console tab) to see socket logs
   - This will be the user RECEIVING notifications

2. **Browser 2 (User B - Different Account)**
   - Open http://localhost:5173 in **NEW BROWSER** or **PRIVATE WINDOW**
   - Login with email: `john@gmail.com` and password: `password123`
   - This will be the user SENDING notifications (liking posts, etc.)

---

### **Step 2: Test LIKE Notifications**

**In Browser 2 (User B - john@gmail.com):**
1. Find a post by "root" user (User A)
2. Click the heart icon to like the post
3. Watch the console in **Browser 1** 

**In Browser 1 (User A - root):**
- Check the DevTools Console (F12)
- You should see logs like:
  ```
  [Socket] ========= NOTIFICATION RECEIVED ==========
  [Socket] Data: {"type":"like","userId":"...","userDetails":{"username":"john_doe",...}...
  [Socket] Type: like
  [Socket] From user: john_doe
  [Socket] Dispatching notification to Redux - Type: like
  [Socket] Dispatch completed
  ```
- The Notifications page should now show the like
- The Notifications icon in the sidebar should show a red dot with count "1"

---

### **Step 3: Test COMMENT Notifications**

**In Browser 2 (User B - john@gmail.com):**
1. Open a post by "root" user (User A)
2. Add a comment on that post
3. Watch the console in **Browser 1**

**In Browser 1 (User A - root):**
- Check the DevTools Console
- You should see notification logs
- Notifications page should show the comment
- Sidebar badge should increment

---

### **Step 4: Test FOLLOW Notifications**

**In Browser 2 (User B - john@gmail.com):**
1. Navigate to root user's profile: `/profile/[userId]`
2. Click the "Follow" button
3. Watch the console in **Browser 1**

**In Browser 1 (User A - root):**
- Check the DevTools Console
- You should see follow notification logs
- Notifications page should show the follow
- Sidebar badge should increment

---

### **Step 5: Test MESSAGE Notifications (Unread Messages)**

**In Browser 2 (User B - john@gmail.com):**
1. Navigate to Chat page
2. Select root user in the sidebar
3. Send a message
4. Watch console in **Browser 1**

**In Browser 1 (User A - root):**
- Check the DevTools Console
- Messages icon in sidebar should show unread count with red dot
- If on Chat page, message should appear in conversation

---

## Expected Console Logs

### Like Notification Backend (in Backend Terminal)
```
[LIKE POST] ===================
[LIKE POST] Liker ID: 65a2b3c4d5e6f7g8h9i0j1k2
[LIKE POST] Post owner ID: 55a1b3c4d5e6f7g8h9i0j1k2
[LIKE POST] Same user?: false
[LIKE POST] User data: { _id: '65a2b3c4d5e6f7g8h9i0j1k2', username: 'john_doe', profilePicture: 'url...', email: 'john@gmail.com' }
[LIKE POST] Post owner socket ID: z1234567890abcdef1234567
[LIKE POST] Notification to emit: { type: 'like', userId: '65a2b3c4d5e6f7g8h9i0j1k2', userDetails: {...}, postId: '95a1b3c4d5e6f7g8h9i0j1k2', message: 'Your post was liked' }
[LIKE POST] ✅ Notification emitted successfully!
```

### Like Notification Frontend (Browser Console)
```
[Socket] ========= NOTIFICATION RECEIVED ==========
[Socket] Data: {"type":"like","userId":"65a2b3c4d5e6f7g8h9i0j1k2","userDetails":{"username":"john_doe","profilePicture":"..."},"postId":"95a1b3c4d5e6f7g8h9i0j1k2","message":"Your post was liked"}
[Socket] Type: like
[Socket] From user: john_doe
[Socket] Dispatching notification to Redux - Type: like
[Socket] Dispatch completed
```

---

## Troubleshooting

### ❌ No console logs appearing?
1. Make sure both browsers are viewing the page (not minimized/hidden)
2. Refresh both pages: `Ctrl+Shift+R` (hard refresh)
3. Check Backend Terminal - should show "[LIKE POST]" logs
4. Check socket connection: Browser Console should show "Socket connected: [socketId]"

### ❌ Backend shows "❌ Post owner not connected"?
1. Verify User A is still on the page (didn't close tab)
2. Check Browser 1 console for socket connection logs
3. Restart both servers and try again

### ❌ Notification shows in console but not on Notifications page?
1. Refresh the Notifications page: `/notifications`
2. Check Redux DevTools if you have it installed
3. Check that `rtnSlice` is properly configured in Redux store

### ❌ Red dot not appearing on Notifications icon?
1. Refresh the page (notifications loaded before socket event)
2. Check that `likeNotification.length > 0` in Redux
3. Check LeftSidebar.jsx is checking correct Redux state

---

## Manual Redux Check

In Browser Console (if Redux DevTools not installed):
```javascript
// Check if notification is in Redux store
var store = window.__REDUX_DEVTOOLS_EXTENSION__ || {};
console.log(store);

// Or directly from the app context - usually available via inspect element
```

---

## What Each Notification Type Shows

| Type | Icon | Color | Message |
|------|------|-------|---------|
| **like** | ❤️ Heart | Red | "{username} liked your post" |
| **comment** | 💬 MessageCircle | Blue | "{username} commented: {text}" |
| **follow** | 👤 UserPlus | Green | "{username} started following you" |
| **message** | 📨 Badge | Gray | Unread message badge on Chat icon |

---

## Success Checklist

- [ ] Browser 1 shows socket connection in console
- [ ] Browser 1 shows "[SOCKET] Online users event" 
- [ ] Like in Browser 2 shows "[LIKE POST] ✅ Notification emitted successfully!"
- [ ] Like notification appears in Browser 1 console with "[Socket]" logs
- [ ] Notification appears on Notifications page
- [ ] Red dot appears on Notifications icon in sidebar
- [ ] Badge shows correct count (1, 2, 3, etc.)
- [ ] Multiple notifications can stack (like + comment + follow)
- [ ] Click notification navigates to post/profile

---

## Notes

- Each notification is **stored in Redux** (rtnSlice)
- Only notifications from **OTHER USERS** are shown (not your own actions)
- Toast alerts should NOT appear (only socket logs in console)
- Notifications persist until user deletes them from the page
- Messages have a separate badge system (unread messages)
