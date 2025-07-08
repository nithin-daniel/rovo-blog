# 🚀 Deployment Guide

This guide covers various deployment options for the Modern Blog Application, from local production to cloud platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Production Deployment](#local-production-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
  - [AWS Deployment](#aws-deployment)
  - [Google Cloud Platform](#google-cloud-platform)
  - [DigitalOcean](#digitalocean)
  - [Azure](#azure)
  - [Heroku](#heroku)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose installed
- Domain name (for production)
- SSL certificate (recommended)
- Cloud account (for cloud deployment)

## 🏠 Local Production Deployment

### Quick Start
```bash
# Clone and setup
git clone <your-repo-url>
cd modern-blog-app

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit environment files with production values
nano server/.env
nano client/.env

# Start production environment
npm run docker:prod
```

### Production Environment Variables

Update `server/.env` with production values:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:your_secure_password@mongodb:27017/blog_app?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Update `client/.env`:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Your Blog Name
```

### Security Checklist
- [ ] Change default MongoDB credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure firewall rules
- [ ] Enable HTTPS
- [ ] Set up regular backups
- [ ] Configure monitoring

## ☁️ Cloud Deployment Options

## AWS Deployment

### Option 1: AWS ECS with Fargate

1. **Build and push Docker image**:
```bash
# Build image
docker build -t your-blog-app .

# Tag for ECR
docker tag your-blog-app:latest your-account.dkr.ecr.region.amazonaws.com/your-blog-app:latest

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com
docker push your-account.dkr.ecr.region.amazonaws.com/your-blog-app:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "blog-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "blog-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/your-blog-app:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "your-mongodb-connection-string"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/blog-app",
          "awslogs-region": "your-region",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Set up Application Load Balancer**
4. **Configure RDS for MongoDB or use DocumentDB**
5. **Set up ElastiCache for Redis**

### Option 2: AWS App Runner

Create `apprunner.yaml`:
```yaml
version: 1.0
runtime: docker
build:
  commands:
    build:
      - echo "Build started on `date`"
      - docker build -t blog-app .
run:
  runtime-version: latest
  command: node server/dist/index.js
  network:
    port: 5000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
    - name: MONGODB_URI
      value: your-mongodb-uri
```

## Google Cloud Platform

### Cloud Run Deployment

1. **Build and deploy**:
```bash
# Set project
gcloud config set project your-project-id

# Build and submit
gcloud builds submit --tag gcr.io/your-project-id/blog-app

# Deploy to Cloud Run
gcloud run deploy blog-app \
  --image gcr.io/your-project-id/blog-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --set-env-vars NODE_ENV=production,MONGODB_URI=your-mongodb-uri
```

2. **Set up Cloud SQL for PostgreSQL or MongoDB Atlas**
3. **Configure Memorystore for Redis**

### GKE Deployment

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-app
  template:
    metadata:
      labels:
        app: blog-app
    spec:
      containers:
      - name: blog-app
        image: gcr.io/your-project-id/blog-app:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: mongodb-uri
---
apiVersion: v1
kind: Service
metadata:
  name: blog-app-service
spec:
  selector:
    app: blog-app
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

## DigitalOcean

### App Platform Deployment

Create `.do/app.yaml`:
```yaml
name: blog-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: node server/dist/index.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 5000
  env:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your-mongodb-uri
    type: SECRET
  - key: JWT_SECRET
    value: your-jwt-secret
    type: SECRET

databases:
- name: blog-db
  engine: MONGODB
  version: "5"
  size: db-s-1vcpu-1gb
```

### Droplet Deployment

1. **Create Droplet with Docker**
2. **Clone repository**:
```bash
git clone your-repo
cd modern-blog-app
```

3. **Set up environment**:
```bash
cp server/.env.example server/.env
# Edit with production values
nano server/.env
```

4. **Deploy**:
```bash
npm run docker:prod:detached
```

5. **Set up Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Azure

### Container Instances

```bash
# Create resource group
az group create --name blog-app-rg --location eastus

# Create container instance
az container create \
  --resource-group blog-app-rg \
  --name blog-app \
  --image your-registry/blog-app:latest \
  --dns-name-label blog-app-unique \
  --ports 5000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables MONGODB_URI=your-mongodb-uri
```

### App Service

Create `azure-pipelines.yml`:
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'your-registry-connection'
  imageRepository: 'blog-app'
  containerRegistry: 'your-registry.azurecr.io'
  dockerfilePath: '$(Build.SourcesDirectory)/Dockerfile'
  tag: '$(Build.BuildId)'

stages:
- stage: Build
  displayName: Build and push stage
  jobs:
  - job: Build
    displayName: Build
    steps:
    - task: Docker@2
      displayName: Build and push an image to container registry
      inputs:
        command: buildAndPush
        repository: $(imageRepository)
        dockerfile: $(dockerfilePath)
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(tag)
```

## Heroku

### Using Container Registry

1. **Login to Heroku Container Registry**:
```bash
heroku login
heroku container:login
```

2. **Create Heroku app**:
```bash
heroku create your-blog-app
```

3. **Build and push**:
```bash
heroku container:push web --app your-blog-app
heroku container:release web --app your-blog-app
```

4. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production --app your-blog-app
heroku config:set MONGODB_URI=your-mongodb-uri --app your-blog-app
heroku config:set JWT_SECRET=your-jwt-secret --app your-blog-app
```

### Using Git Deployment

Create `Procfile`:
```
web: node server/dist/index.js
```

Create `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: node server/dist/index.js
```

## 🔧 Environment Configuration

### Production Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb://user:pass@host:port/db` |
| `REDIS_URL` | Cache connection | `redis://host:port` |
| `JWT_SECRET` | JWT signing key | `your-32-char-secret` |
| `CLIENT_URL` | Frontend URL | `https://yourdomain.com` |
| `EMAIL_*` | Email configuration | SMTP settings |
| `CLOUDINARY_*` | Image upload service | API credentials |

### Security Best Practices

1. **Use strong passwords and secrets**
2. **Enable HTTPS everywhere**
3. **Set up proper CORS**
4. **Configure rate limiting**
5. **Regular security updates**
6. **Monitor for vulnerabilities**

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Configure network access
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in environment

### Self-hosted MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your-secure-password \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### Redis Setup

#### Redis Cloud (Recommended)
1. Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create database
3. Get connection URL
4. Update `REDIS_URL`

#### Self-hosted Redis
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7.2-alpine
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Get certificate**:
```bash
sudo certbot --nginx -d yourdomain.com
```

3. **Auto-renewal**:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure page rules

## 📊 Monitoring & Logging

### Application Monitoring

#### Using PM2 (for Node.js apps)
```bash
npm install -g pm2

# Start with PM2
pm2 start server/dist/index.js --name blog-app

# Monitor
pm2 monit

# Logs
pm2 logs blog-app
```

#### Using Docker Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

### Log Management

#### Centralized Logging with ELK Stack
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### Performance Monitoring

#### Using New Relic
```javascript
// Add to server/src/index.ts
require('newrelic');
```

#### Using DataDog
```bash
# Add DataDog agent to Docker Compose
datadog:
  image: datadog/agent:latest
  environment:
    - DD_API_KEY=your-api-key
    - DD_SITE=datadoghq.com
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /proc/:/host/proc/:ro
    - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
```

## 💾 Backup Strategy

### Database Backups

#### MongoDB Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="blog_app"

mkdir -p $BACKUP_DIR

# Create backup
mongodump --host localhost:27017 \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --db $DB_NAME \
  --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongodb_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: mongodb_backup_$DATE.tar.gz"
```

#### Automated Backup with Cron
```bash
# Add to crontab
0 2 * * * /path/to/backup-mongodb.sh
```

### File Backups

#### Backup uploads directory
```bash
#!/bin/bash
# backup-uploads.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/uploads"
UPLOADS_DIR="/app/uploads"

mkdir -p $BACKUP_DIR

# Create backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $UPLOADS_DIR .

# Keep only last 30 days
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +30 -delete

echo "Uploads backup completed: uploads_backup_$DATE.tar.gz"
```

### Cloud Backup Solutions

#### AWS S3 Backup
```bash
# Install AWS CLI
pip install awscli

# Sync uploads to S3
aws s3 sync /app/uploads s3://your-backup-bucket/uploads/

# Backup database to S3
aws s3 cp /backups/mongodb/mongodb_backup_$DATE.tar.gz s3://your-backup-bucket/database/
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs container-name

# Check resource usage
docker stats

# Inspect container
docker inspect container-name
```

#### Database Connection Issues
```bash
# Test MongoDB connection
docker exec -it mongodb mongosh -u admin -p password

# Test Redis connection
docker exec -it redis redis-cli ping
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check application logs
npm run docker:logs

# Profile application
node --inspect server/dist/index.js
```

#### SSL Certificate Issues
```bash
# Check certificate status
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Health Check Endpoints

Add health check endpoints to your application:

```typescript
// server/src/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

router.get('/health/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    // Check Redis connection
    const redisStatus = await checkRedisConnection();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
```

### Monitoring Scripts

#### System Health Check
```bash
#!/bin/bash
# health-check.sh

echo "=== System Health Check ==="
echo "Date: $(date)"
echo

# Check disk space
echo "Disk Usage:"
df -h

echo

# Check memory usage
echo "Memory Usage:"
free -h

echo

# Check Docker containers
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo

# Check application health
echo "Application Health:"
curl -s http://localhost:5000/health | jq .

echo

# Check database connection
echo "Database Status:"
docker exec mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>/dev/null && echo "MongoDB: OK" || echo "MongoDB: ERROR"

# Check Redis connection
echo "Redis Status:"
docker exec redis redis-cli ping 2>/dev/null && echo "Redis: OK" || echo "Redis: ERROR"
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream blog_app {
    server app1:5000;
    server app2:5000;
    server app3:5000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://blog_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml blog-app

# Scale service
docker service scale blog-app_web=3
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-app
  template:
    metadata:
      labels:
        app: blog-app
    spec:
      containers:
      - name: blog-app
        image: your-registry/blog-app:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Database Scaling

#### MongoDB Replica Set
```javascript
// mongo-replica-init.js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
```

#### Redis Cluster
```yaml
# redis-cluster.yml
version: '3.8'
services:
  redis-1:
    image: redis:7.2-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    
  redis-2:
    image: redis:7.2-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    
  redis-3:
    image: redis:7.2-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
```

## 🎯 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Security review completed

### Deployment
- [ ] Build and test application
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Test critical functionality
- [ ] Monitor for errors

### Post-deployment
- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Verify backup systems
- [ ] Test disaster recovery
- [ ] Document any issues
- [ ] Update team on deployment status

## 📞 Support

For deployment issues:

1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test individual services
5. Check cloud provider status pages

Remember to always test deployments in a staging environment before deploying to production!

---

**Happy Deploying! 🚀**