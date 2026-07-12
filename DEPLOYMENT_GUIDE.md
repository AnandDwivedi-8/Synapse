# Deployment Guide - Instaclone with Message Encryption

## Overview
This guide covers deploying your MERN Instagram clone with encrypted messaging to production environments.

---

## Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (or self-hosted MongoDB)
- Cloudinary account (for image uploads)
- Hosting platform (Render, Railway, Vercel, AWS, etc.)
- Git repository

---

## Part 1: Prepare for Production

### 1.1 Environment Variables Setup

Create `.env` file in root directory with production values:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/synapse?retryWrites=true&w=majority

# Server
PORT=8000
NODE_ENV=production

# Authentication & Security
SECRET_KEY=your_super_secret_key_production_grade_minimum_32_chars
ENCRYPTION_KEY=your_encryption_key_production_grade_minimum_32_chars
JWT_SECRET=your_jwt_secret_production_grade_minimum_32_chars

# Frontend
URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Cloudinary (Image Uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=https://your-domain.com
```

**Important Security Notes:**
- ✅ Use strong, random keys (minimum 32 characters)
- ✅ Never commit `.env` to Git
- ✅ Each key should be unique
- ✅ Use environment-specific values
- ✅ Store sensitive values in hosting platform's secret manager

### 1.2 Update CORS Configuration

Edit `backend/index.js`:

```javascript
const corsOptions = {
    origin: process.env.CORS_ORIGIN || process.env.URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));
```

### 1.3 Update Frontend API URL

Edit `frontend/src/lib/axios.js`:

```javascript
const API = axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true
});
```

Create `frontend/.env.production`:

```
VITE_API_URL=https://your-api-domain.com/api/v1
```

### 1.4 Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized production bundle in `dist/` folder.

---

## Part 2: Database Setup

### 2.1 MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create free cluster
3. Set IP whitelist to `0.0.0.0/0` (or specific IPs)
4. Create database user with strong password
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/synapse`
6. Add to `.env` as `MONGO_URI`

### 2.2 Migrate Existing Data (Optional)

If migrating from local database:

```bash
# Export from local
mongodump --uri="mongodb://localhost:27017/synapse" --out dump/

# Import to MongoDB Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/synapse" dump/synapse/

# Verify encryption
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/synapse" --eval "db.messages.findOne()"
```

---

## Part 3: Choose Hosting Platform

### Option A: Render.com (Recommended for beginners)

#### Backend Deployment

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Connect Render to GitHub account

2. **Create New Web Service**
   - Go to render.com → Dashboard → New → Web Service
   - Select GitHub repo
   - Configuration:
     - **Name:** instaclone-backend
     - **Environment:** Node
     - **Region:** Choose closest to users
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

3. **Add Environment Variables**
   - Go to Service → Environment
   - Add all variables from `.env`
   - **Critical:** Set `NODE_ENV=production`

4. **Deploy**
   - Render automatically deploys on Git push
   - Logs available in Dashboard

#### Frontend Deployment

1. **Create Static Site**
   - Render → New → Static Site
   - Select GitHub repo
   - Configuration:
     - **Name:** instaclone-frontend
     - **Build Command:** `cd frontend && npm run build`
     - **Publish Directory:** `frontend/dist`

2. **Configure Redirects**
   - Create `frontend/public/_redirects`:
     ```
     /* /index.html 200
     ```

3. **Environment Variables**
   - Set `VITE_API_URL=https://your-backend-url.onrender.com/api/v1`

### Option B: Railway.app

#### Backend Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add MongoDB Plugin
railway add
# Select MongoDB

# Set environment variables
railway variables set MONGO_URI=your_connection_string
railway variables set SECRET_KEY=your_secret

# Deploy
railway up
```

#### Frontend Setup
```bash
# Build
npm run build

# Deploy to Railway
railway up --from ./frontend/dist
```

### Option C: AWS EC2 + S3

#### EC2 Backend
```bash
# SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Node
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Clone repo
git clone your-repo
cd instaclone-main

# Install & build
npm install
cd frontend && npm run build && cd ..

# Create .env
sudo nano .env
# Add environment variables

# Install PM2 for process management
npm install -g pm2

# Start backend
pm2 start backend/index.js --name "instaclone"
pm2 startup
pm2 save
```

#### S3 + CloudFront for Frontend
```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync frontend/dist/ s3://your-bucket/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option D: Vercel (Frontend) + Any Backend

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Part 4: SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# For Render.com - Automatic
# (Render provides free SSL certificates)

# For self-hosted servers
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

---

## Part 5: Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database connection verified
- [ ] Cloudinary account configured
- [ ] CORS origins updated to production domain
- [ ] SSL certificate installed
- [ ] Frontend API URL points to backend
- [ ] Backend logs show "Server listen at port 8000"
- [ ] Test login functionality
- [ ] Test message sending (with encryption)
- [ ] Test image uploads
- [ ] Monitor application logs

---

## Part 6: Monitoring & Maintenance

### Enable Logging

Add to `backend/index.js`:

```javascript
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
```

### Performance Optimization

```javascript
// backend/index.js - Add compression
import compression from 'compression';
app.use(compression());

// Limit request size
app.use(express.json({ limit: '10mb' }));
app.use(urlencoded({ limit: '10mb', extended: true }));
```

### Rate Limiting

```javascript
// npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Database Backups

For MongoDB Atlas:
1. Dashboard → Backup → Enable daily backups
2. Restore snapshots anytime needed

---

## Part 7: Domain Setup

### Update DNS Records

```
Type    Name    Value
A       @       Your-Server-IP
A       www     Your-Server-IP
CNAME   api     backend-url.onrender.com
```

### Update Backend URL

If using custom domain for backend:
- `backend/socket.js` - Update CORS origin
- `frontend/axios.js` - Update baseURL
- `.env` - Update URL and CORS_ORIGIN

---

## Part 8: Troubleshooting

### Issue: "MONGO_URI not found"
```
Solution: Verify .env file exists and MONGO_URI is set
Check: cat .env | grep MONGO_URI
```

### Issue: "Cannot POST /message/send"
```
Solution: Check CORS is configured correctly
Add: console.log('CORS origin:', process.env.CORS_ORIGIN)
```

### Issue: "Connection refused on port 8000"
```
Solution: Check PORT is available
Command: lsof -i :8000  (on Linux/Mac)
Or: netstat -ano | findstr :8000 (on Windows)
```

### Issue: Images not uploading
```
Solution: Verify Cloudinary credentials
Check: CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### Issue: Encryption errors
```
Solution: Verify ENCRYPTION_KEY is set in .env
Check: All servers use same ENCRYPTION_KEY
```

---

## Part 9: Performance Tips

1. **Enable Caching**
   ```javascript
   app.use(express.static('frontend/dist', {
       maxAge: '1d',
       etag: false
   }));
   ```

2. **Database Indexing**
   ```javascript
   // Create indexes for faster queries
   db.messages.createIndex({ conversation_id: 1 });
   db.messages.createIndex({ createdAt: -1 });
   ```

3. **Image Optimization**
   - Cloudinary auto-optimizes
   - Request thumbnails when possible
   - Use responsive images

4. **API Response Caching**
   ```javascript
   // Cache GET requests for 5 minutes
   const cache = require('memory-cache');
   app.get('/api/v1/user/:id', cache.route('5 minutes'), getUserProfile);
   ```

---

## Part 10: Security Hardening

### Update Security Headers

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### HTTPS Redirect

```javascript
app.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
});
```

### Content Security Policy

```javascript
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imageSrc: ["'self'", "data:", "https:"],
    }
}));
```

---

## Quick Deploy Checklist

```bash
# 1. Build frontend
npm run build

# 2. Verify environment variables
cat .env

# 3. Test locally
npm start

# 4. Commit and push
git add .
git commit -m "Production deployment"
git push origin main

# 5. Deploy on platform (Render, Railway, etc)
# Platform auto-deploys from Git push

# 6. Verify deployment
curl https://your-domain.com/api/v1/user/suggested
# Should return user data (requires auth token)

# 7. Check logs
# Platform dashboard → Logs
```

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Render | ✅ (512MB RAM) | $7+ |
| MongoDB Atlas | ✅ (512MB) | $10+ |
| Cloudinary | ✅ (10GB/month) | $99+ |
| Domain | - | $10-15 |
| CDN | Optional | $10+ |
| **Total** | **Free** | **$50+** |

---

## Post-Launch Monitoring

1. **Monitor Server Health**
   - CPU usage
   - Memory usage
   - Database connections
   - Error rates

2. **Monitor Encryption**
   - Verify messages encrypted in DB
   - Check decryption working
   - Monitor encryption performance

3. **User Analytics**
   - Login success rate
   - Message delivery time
   - Active users
   - Error frequency

---

## Support & Scaling

### When to Scale
- CPU usage > 80% consistently
- Response time > 1 second
- Database connections > 80% of limit
- More than 1000 concurrent users

### Scaling Options
1. **Vertical Scaling** - Increase server RAM/CPU
2. **Horizontal Scaling** - Add more server instances
3. **Database Sharding** - Distribute data across multiple databases
4. **CDN** - Cache static content globally

---

## Final Notes

✅ **Your app is production-ready with:**
- AES message encryption
- JWT authentication
- Secure CORS
- Database backups
- Cloudinary integration

🚀 **Recommended first deployment:** Render.com (easiest for beginners)

💡 **Monitor after launch and adjust as needed!**
