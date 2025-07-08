# 🚀 Render.com Separate Frontend & Backend Deployment

This guide covers deploying your Modern Blog Application as separate frontend and backend services on Render.com, which is the recommended approach for better scalability and maintenance.

## 📋 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React SPA)   │───▶│   (Node.js API) │───▶│   (MongoDB)     │
│   Static Site   │    │   Web Service   │    │   Atlas/Render  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Database Setup (First Step)

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free M0 cluster
   - Create database user with read/write permissions
   - Add IP address `0.0.0.0/0` to whitelist (for Render access)

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/blog_app?retryWrites=true&w=majority
   ```

### Redis Setup (Optional)

1. **Option 1: Render Redis**
   - Will be created automatically with backend service

2. **Option 2: Redis Cloud**
   - Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Create free database
   - Get connection URL

## 🔧 Backend Deployment

### Step 1: Prepare Backend Repository

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Test build locally**:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```

3. **Commit backend code** (if using separate repos):
   ```bash
   git init
   git add .
   git commit -m "Backend ready for Render"
   git remote add origin https://github.com/yourusername/blog-backend.git
   git push -u origin main
   ```

### Step 2: Create Backend Service on Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect GitHub account
   - Select backend repository
   - Choose main branch

3. **Configure Backend Service**
   ```
   Name: blog-api
   Environment: Node
   Region: Choose closest to users
   Branch: main
   Root Directory: server (if using monorepo) or leave empty
   Build Command: ./build.sh
   Start Command: node dist/index.js
   ```

4. **Set Instance Type**
   - **Starter**: $7/month (recommended)
   - **Standard**: $25/month (for high traffic)

### Step 3: Configure Backend Environment Variables

Add these in Render dashboard:

#### Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog_app?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters_long
CLIENT_URL=https://your-frontend-app.onrender.com
```

#### Optional Variables
```env
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Add Redis Service (Optional)

1. **Create Redis Service**
   - In Render dashboard: "New +" → "Redis"
   - Name: `blog-redis`
   - Plan: Starter ($7/month)

2. **Connect to Backend**
   - Copy Redis connection URL
   - Add to backend environment variables:
   ```env
   REDIS_URL=redis://username:password@host:port
   ```

### Step 5: Deploy Backend

1. **Deploy**
   - Click "Create Web Service"
   - Monitor build logs
   - Wait for deployment to complete

2. **Verify Backend**
   - Visit: `https://your-backend-app.onrender.com/health`
   - Should return: `{"success": true, "message": "Server is running"}`

## 🌐 Frontend Deployment

### Step 1: Prepare Frontend Repository

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Update API URL**:
   Create/update `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

3. **Test build locally**:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```

4. **Commit frontend code** (if using separate repos):
   ```bash
   git init
   git add .
   git commit -m "Frontend ready for Render"
   git remote add origin https://github.com/yourusername/blog-frontend.git
   git push -u origin main
   ```

### Step 2: Create Frontend Service on Render

1. **Create Static Site**
   - In Render dashboard: "New +" → "Static Site"

2. **Connect Repository**
   - Select frontend repository
   - Choose main branch

3. **Configure Frontend Service**
   ```
   Name: blog-frontend
   Branch: main
   Root Directory: client (if using monorepo) or leave empty
   Build Command: ./build.sh
   Publish Directory: dist
   ```

### Step 3: Configure Frontend Environment Variables

Add these in Render dashboard:

```env
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=Modern Blog
VITE_APP_VERSION=1.0.0
```

### Step 4: Configure Redirects for SPA

1. **Create `_redirects` file** in `client/public/`:
   ```
   /*    /index.html   200
   ```

2. **Or use Headers/Redirects in Render dashboard**:
   - Go to Settings → Redirects/Rewrites
   - Add rule: `/*` → `/index.html` (200)

### Step 5: Deploy Frontend

1. **Deploy**
   - Click "Create Static Site"
   - Monitor build logs
   - Wait for deployment to complete

2. **Verify Frontend**
   - Visit: `https://your-frontend-app.onrender.com`
   - Should load React application

## 🔗 Connect Frontend to Backend

### Update Backend CORS

Make sure your backend allows requests from frontend:

```javascript
// In server/src/index.ts
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://your-frontend-app.onrender.com',
  credentials: true
}));
```

### Update Frontend API Calls

Ensure all API calls use the correct backend URL:

```javascript
// In client/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com/api';
```

## 📁 File Structure for Separate Deployment

### Backend Structure
```
server/
├── src/
├── package.json
├── Dockerfile
├── build.sh
├── render.yaml
├── .env.render
└── README.md
```

### Frontend Structure
```
client/
├── src/
├── public/
│   └── _redirects
├── package.json
├── Dockerfile
├── nginx.conf
├── build.sh
├── render.yaml
├── .env.render
└── README.md
```

## 🔧 Environment Variables Summary

### Backend Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend-app.onrender.com
REDIS_URL=redis://... (optional)
EMAIL_HOST=smtp.gmail.com (optional)
EMAIL_USER=your_email@gmail.com (optional)
EMAIL_PASS=your_app_password (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=Modern Blog
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment Order

1. **Deploy Backend First**
   - Set up database
   - Deploy backend service
   - Note the backend URL

2. **Deploy Frontend Second**
   - Update API URL to backend
   - Deploy frontend service
   - Update backend CORS with frontend URL

## 💰 Cost Breakdown

### Recommended Setup
- **Backend (Starter)**: $7/month
- **Frontend (Static Site)**: Free
- **Redis (Starter)**: $7/month (optional)
- **MongoDB Atlas**: Free (M0 cluster)
- **Total**: $7-14/month

### High Traffic Setup
- **Backend (Standard)**: $25/month
- **Frontend (Static Site)**: Free
- **Redis (Standard)**: $25/month
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Total**: $34-59/month

## 🔍 Monitoring & Debugging

### Health Check Endpoints

#### Backend Health Check
```bash
curl https://your-backend-app.onrender.com/health
```

#### Frontend Health Check
```bash
curl https://your-frontend-app.onrender.com/health
```

### Common Issues & Solutions

#### CORS Issues
```javascript
// Backend: Update CORS configuration
app.use(cors({
  origin: ['https://your-frontend-app.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

#### API Connection Issues
```javascript
// Frontend: Check API URL configuration
console.log('API URL:', import.meta.env.VITE_API_URL);
```

#### Build Issues
```bash
# Check build logs in Render dashboard
# Verify all dependencies are in package.json
# Test build locally first
```

## 🔄 CI/CD Pipeline

### GitHub Actions for Backend

Create `.github/workflows/deploy-backend.yml`:
```yaml
name: Deploy Backend to Render

on:
  push:
    branches: [ main ]
    paths: [ 'server/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: cd server && npm ci
      
    - name: Run tests
      run: cd server && npm test
      
    - name: Deploy to Render
      run: |
        curl -X POST "https://api.render.com/deploy/srv-YOUR_BACKEND_SERVICE_ID" \
        -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

### GitHub Actions for Frontend

Create `.github/workflows/deploy-frontend.yml`:
```yaml
name: Deploy Frontend to Render

on:
  push:
    branches: [ main ]
    paths: [ 'client/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: cd client && npm ci
      
    - name: Run tests
      run: cd client && npm test
      
    - name: Deploy to Render
      run: |
        curl -X POST "https://api.render.com/deploy/srv-YOUR_FRONTEND_SERVICE_ID" \
        -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Backend repository prepared
- [ ] Frontend repository prepared
- [ ] Environment variables documented
- [ ] Build scripts tested locally

### Backend Deployment
- [ ] Backend service created on Render
- [ ] Environment variables configured
- [ ] Redis service created (optional)
- [ ] Backend deployed successfully
- [ ] Health check endpoint working
- [ ] API endpoints accessible

### Frontend Deployment
- [ ] Frontend static site created on Render
- [ ] API URL configured to backend
- [ ] Environment variables set
- [ ] Redirects configured for SPA
- [ ] Frontend deployed successfully
- [ ] Application loads correctly

### Post-Deployment
- [ ] Frontend can communicate with backend
- [ ] CORS configured correctly
- [ ] Database connections working
- [ ] Authentication flow working
- [ ] Error monitoring set up

## 🎉 Success!

Your Modern Blog Application is now deployed as separate services:

### Access Points
- **Frontend**: `https://your-frontend-app.onrender.com`
- **Backend API**: `https://your-backend-app.onrender.com/api`
- **Backend Health**: `https://your-backend-app.onrender.com/health`

### Benefits of Separate Deployment
- ✅ **Independent Scaling**: Scale frontend and backend separately
- ✅ **Cost Optimization**: Frontend is free static site
- ✅ **Better Performance**: CDN for frontend, optimized backend
- ✅ **Easier Maintenance**: Deploy frontend/backend independently
- ✅ **Team Collaboration**: Frontend and backend teams can work separately

---

**Happy Deploying with Separate Services! 🚀**