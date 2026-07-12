# Synapse - Test Users Documentation

## Overview
This document contains all test user credentials for testing the Synapse application (Instagram Clone).

---

## Test User Accounts

### 1. **Root User** (Original Account)
- **Username**: root
- **Email**: an@gmail.com
- **Password**: (Your existing password)
- **Bio**: -
- **Use Case**: Main test account for all features

---

### 2. **John Doe**
- **Username**: john_doe
- **Email**: john@gmail.com
- **Password**: password123
- **Bio**: Photography enthusiast
- **Use Case**: Test messaging, follow/unfollow, like/comment on posts

---

### 3. **Jane Smith**
- **Username**: jane_smith
- **Email**: jane@gmail.com
- **Password**: password123
- **Bio**: Designer & Artist
- **Use Case**: Test conversation, profile viewing, message reactions

---

### 4. **Tech Guru**
- **Username**: tech_guru
- **Email**: tech@gmail.com
- **Password**: password123
- **Bio**: Web Developer
- **Use Case**: Test posting, following, direct messaging

---

### 5. **Sarah Pink**
- **Username**: sarah_pink
- **Email**: sarah@gmail.com
- **Password**: password123
- **Bio**: Fashion blogger
- **Use Case**: Test edit profile, view followers/following

---

### 6. **Mike Travel**
- **Username**: mike_travel
- **Email**: mike@gmail.com
- **Password**: password123
- **Bio**: Travel vlogger
- **Use Case**: Test all messaging features (edit, delete, reactions)

---

## Testing Guide

### How to Test Features:

#### **1. Messaging Features**
1. Login as `john_doe` (password123)
2. Go to **Messages/Chat** section
3. Click on any other user (e.g., `jane_smith`)
4. Test:
   - ✅ Send messages
   - ✅ Edit your messages (hover → pencil icon)
   - ✅ Delete your messages (hover → trash icon)
   - ✅ Add reactions (hover → smile icon, choose emoji)
   - ✅ See online/offline status

#### **2. Post Features**
1. Login as any user
2. Click **Create Post** button
3. Test:
   - ✅ Upload image
   - ✅ Add caption
   - ✅ Like/Unlike posts
   - ✅ Double-tap to like
   - ✅ Comment on posts
   - ✅ Edit/Delete own comments
   - ✅ See post count update in RightSidebar

#### **3. Profile Features**
1. Click on any user's profile
2. Test:
   - ✅ View profile picture with pencil edit icon
   - ✅ Follow/Unfollow user
   - ✅ View followers/following lists
   - ✅ Edit own profile (click pencil icon)
   - ✅ View 3-column post grid

#### **4. Search & Discovery**
1. Use search in left sidebar
2. Test:
   - ✅ Find users by username
   - ✅ View suggested users
   - ✅ Follow users from suggestions

---

## Quick Credentials Reference

| Login | Password | Email |
|-------|----------|-------|
| root | your_pass | an@gmail.com |
| john_doe | password123 | john@gmail.com |
| jane_smith | password123 | jane@gmail.com |
| tech_guru | password123 | tech@gmail.com |
| sarah_pink | password123 | sarah@gmail.com |
| mike_travel | password123 | mike@gmail.com |

---

## Database Connection Details

- **Database**: MongoDB
- **URL**: mongodb://localhost:27017/synapse
- **Database Name**: synapse

---

## Backend Configuration

- **Backend Port**: 4000
- **Frontend Port**: 5173
- **API Base URL**: http://localhost:4000/api/v1
- **JWT Secret**: synapse_super_secret_key_12345_do_not_share

---

## Common Issues & Solutions

### Issue: "Authentication Error: invalid signature"
**Solution**: 
1. Open DevTools (F12)
2. Go to Application → Cookies → Delete all cookies for localhost:5173
3. Clear Local Storage
4. Refresh page and log in again

### Issue: No users appearing in chat
**Solution**:
1. Ensure you're logged in
2. Check if other users exist by viewing suggested users
3. Run `node create-test-users.js` again to create more test users

### Issue: Messages not sending
**Solution**:
1. Check if backend is running on port 4000
2. Verify MongoDB connection
3. Clear browser cache and login again

---

## Created Date
- **Date**: December 6, 2025
- **Total Test Users**: 6 (including root)
- **Default Password**: password123 (for test users only)

---

## ⚠️ Security Note
⚠️ **These are TEST CREDENTIALS ONLY**
- Never use "password123" in production
- Change all passwords before deploying
- Update JWT_SECRET with a strong key
- Use environment variables for sensitive data
- Clear all test users before going live

---

## Features Implemented & Ready to Test

✅ **Authentication**: Login, Register, Logout
✅ **Posts**: Create, Delete, Like, Unlike, Comment, Edit Comments, Delete Comments
✅ **Profile**: View, Edit, Follow, Unfollow, Followers/Following modals
✅ **Messages**: Send, Edit, Delete, Emoji Reactions, Online Status
✅ **Real-time**: Socket.io for live messaging and notifications
✅ **Theme**: Dark/Light mode with CSS variables
✅ **UI**: Instagram-style design with all modern features

---

**Happy Testing! 🚀**
