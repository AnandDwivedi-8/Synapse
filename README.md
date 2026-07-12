Project Overview
Synapse is a full-stack Instagram clone built with MERN (MongoDB, Express, React, Node.js) that includes:

✅ User authentication (JWT + cookies)
✅ Posts with likes and comments
✅ User profiles with follow/unfollow
✅ Real-time messaging with AES-256 encryption
✅ Image uploads via Cloudinary
✅ Dark/Light theme support
✅ Responsive design with Tailwind CSS
Tech Stack:

Frontend: React 18, Redux, Vite, Tailwind CSS, Socket.io-client
Backend: Node.js, Express, MongoDB, Socket.io, JWT, crypto-js
Database: MongoDB (Atlas cloud)
Images: Cloudinary CDN
Deployment: Ready for Render, Railway, AWS
File Structure
instaclone-main/
├── frontend/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── Home.jsx              # Main feed page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Sign up page
│   │   │   ├── Profile.jsx           # User profile page
│   │   │   ├── EditProfile.jsx       # Edit profile page
│   │   │   ├── ChatPage.jsx          # Messages main container
│   │   │   ├── Messages.jsx          # Individual messages display
│   │   │   ├── Feed.jsx              # Posts feed
│   │   │   ├── Post.jsx              # Individual post component
│   │   │   ├── Comment.jsx           # Comment component
│   │   │   ├── CreatePost.jsx        # Create new post modal
│   │   │   ├── LeftSidebar.jsx       # Navigation sidebar
│   │   │   ├── RightSidebar.jsx      # Suggested users
│   │   │   ├── Stories.jsx           # Stories section
│   │   │   ├── SuggestedUsers.jsx    # Suggestions section
│   │   │   ├── ProtectedRoutes.jsx   # Route protection wrapper
│   │   │   ├── MainLayout.jsx        # Main layout wrapper
│   │   │   └── ui/                   # Reusable UI components
│   │   │       ├── button.jsx
│   │   │       ├── input.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── avatar.jsx
│   │   │       └── ...
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useGetAllPost.jsx     # Fetch all posts
│   │   │   ├── useGetAllMessage.jsx  # Fetch all messages
│   │   │   ├── useGetConversations.jsx
│   │   │   ├── useGetRTM.jsx         # Real-time messages
│   │   │   ├── useGetSuggestedUsers.jsx
│   │   │   ├── useGetUserProfile.jsx
│   │   │   └── useSearchUsers.jsx
│   │   ├── redux/                    # Redux state management
│   │   │   ├── authSlice.js          # Auth state
│   │   │   ├── postSlice.js          # Posts state
│   │   │   ├── chatSlice.js          # Messages state
│   │   │   ├── socketSlice.js        # Socket.io state
│   │   │   ├── rtnSlice.js           # Real-time state
│   │   │   └── store.js              # Redux store config
│   │   ├── lib/
│   │   │   ├── axios.js              # Axios config + interceptors
│   │   │   └── utils.js              # Utility functions
│   │   ├── context/
│   │   │   └── ThemeContext.jsx      # Dark/Light theme
│   │   ├── styles/
│   │   │   ├── theme.css             # Theme CSS variables
│   │   │   └── index.css
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Express backend
│   ├── controllers/                  # Business logic
│   │   ├── user.controller.js        # User operations (login, signup, profile)
│   │   ├── post.controller.js        # Post operations (create, like, comment)
│   │   └── message.controller.js     # Message operations (send, fetch, encrypt)
│   ├── models/                       # MongoDB schemas
│   │   ├── user.model.js             # User schema
│   │   ├── post.model.js             # Post schema
│   │   ├── message.model.js          # Message schema (encrypted)
│   │   ├── comment.model.js          # Comment schema
│   │   └── conversation.model.js     # Conversation schema
│   ├── routes/                       # API endpoints
│   │   ├── user.route.js             # User endpoints
│   │   ├── post.route.js             # Post endpoints
│   │   └── message.route.js          # Message endpoints
│   ├── middlewares/                  # Express middlewares
│   │   ├── isAuthenticated.js        # JWT verification
│   │   ├── multer.js                 # File upload config
│   ├── utils/
│   │   ├── db.js                     # MongoDB connection
│   │   ├── encryption.js             # AES encryption/decryption ⭐
│   │   ├── cloudinary.js             # Image upload config
│   │   └── datauri.js                # Base64 converter
│   ├── socket/
│   │   └── socket.js                 # Socket.io setup (real-time)
│   ├── index.js                      # Main server file
│   ├── run-encrypt.js                # Migration script (encrypt messages)
│   ├── package.json
│   └── .env                          # Environment variables
│
├── .env                              # Root environment variables
├── RUN_ALL.bat                       # Windows batch to run both servers
├── run-synapse.ps1                   # PowerShell script to run both servers
├── DEPLOYMENT_GUIDE.md               # Deployment instructions
├── ENCRYPTION_IMPLEMENTATION.md      # Encryption details
└── DEPLOYMENT_SIZE_GUIDE.md          # Size optimization guide
