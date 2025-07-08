# 🐳 Docker Setup Guide

This guide will help you run the Modern Blog Application using Docker for easy setup and deployment.

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

### One-Command Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd modern-blog-app

# Setup Docker environment
npm run docker:setup

# Start development environment
npm run docker:dev
```

### Access the Application
Once the containers are running, you can access:

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017 (admin/password123)
- **Redis**: localhost:6379

## 🛠️ Available Docker Commands

### Development Environment
```bash
# Start development with hot reload
npm run docker:dev

# Start development in background
npm run docker:dev:detached

# View development logs
npm run docker:logs:dev
```

### Production Environment
```bash
# Build and start production
npm run docker:prod

# Start production in background
npm run docker:prod:detached

# View production logs
npm run docker:logs
```

### Management Commands
```bash
# Stop all containers
npm run docker:stop

# Clean up containers and volumes
npm run docker:clean

# Setup Docker environment
npm run docker:setup
```

## 🏗️ Docker Architecture

### Services Overview

#### Development (`docker-compose.dev.yml`)
- **blog_mongodb_dev**: MongoDB 7.0 database
- **blog_redis_dev**: Redis 7.2 cache
- **blog_server_dev**: Node.js backend with hot reload
- **blog_client_dev**: React frontend with Vite dev server

#### Production (`docker-compose.yml`)
- **mongodb**: MongoDB 7.0 database
- **redis**: Redis 7.2 cache
- **blog_app**: Full-stack application (built)
- **nginx**: Reverse proxy serving frontend and API

### Container Details

#### MongoDB Container
- **Image**: mongo:7.0
- **Port**: 27017
- **Credentials**: admin/password123
- **Database**: blog_app
- **Volume**: Persistent data storage

#### Redis Container
- **Image**: redis:7.2-alpine
- **Port**: 6379
- **Volume**: Persistent cache storage

#### Application Container
- **Base**: node:18-alpine
- **Ports**: 5000 (API), 3000 (Frontend in production)
- **Environment**: Configurable via environment variables

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Key variables include:

#### Database
```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/blog_app?authSource=admin
REDIS_URL=redis://redis:6379
```

#### Authentication
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

#### Email (Optional)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Cloudinary (Optional)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Customizing Configuration

1. **Development**: Modify `docker-compose.dev.yml`
2. **Production**: Modify `docker-compose.yml`
3. **Environment**: Create `.env` files in server and client directories

## 📁 Volume Management

### Persistent Data
- **MongoDB Data**: `mongodb_data` volume
- **Redis Data**: `redis_data` volume
- **Uploads**: `./uploads` directory mounted to containers

### Development Volumes
- **Server Code**: `./server` mounted for hot reload
- **Client Code**: `./client` mounted for hot reload
- **Shared Types**: `./shared` mounted to both containers

## 🔍 Troubleshooting

### Common Issues

#### Port Conflicts
If ports 3000, 5000, 27017, or 6379 are already in use:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5000
lsof -i :27017
lsof -i :6379

# Stop conflicting services or modify ports in docker-compose files
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

#### Container Build Issues
```bash
# Clean Docker cache and rebuild
docker system prune -a
npm run docker:clean
npm run docker:dev
```

#### Database Connection Issues
```bash
# Check MongoDB container logs
docker logs blog_mongodb_dev

# Connect to MongoDB directly
docker exec -it blog_mongodb_dev mongosh -u admin -p password123
```

### Useful Commands

#### View Container Status
```bash
docker ps
docker-compose ps
```

#### Access Container Shell
```bash
# Server container
docker exec -it blog_server_dev sh

# MongoDB container
docker exec -it blog_mongodb_dev mongosh -u admin -p password123

# Redis container
docker exec -it blog_redis_dev redis-cli
```

#### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs blog_server_dev
docker-compose logs mongodb
```

## 🚀 Deployment

### Production Deployment

1. **Update Environment Variables**:
   ```bash
   # Update production values in docker-compose.yml
   # Set strong passwords and secrets
   ```

2. **Build and Deploy**:
   ```bash
   npm run docker:prod:detached
   ```

3. **Monitor**:
   ```bash
   npm run docker:logs
   ```

### Cloud Deployment

The Docker setup is ready for cloud deployment on:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## 📊 Performance

### Resource Usage
- **Development**: ~2GB RAM, 4 containers
- **Production**: ~1GB RAM, 4 containers
- **Storage**: ~500MB for base images + data volumes

### Optimization Tips
- Use `.dockerignore` to reduce build context
- Multi-stage builds minimize final image size
- Alpine Linux base images for smaller footprint
- Volume mounts for development hot reload

## 🔐 Security

### Production Security
- Change default passwords
- Use strong JWT secrets
- Enable HTTPS with reverse proxy
- Restrict database access
- Regular security updates

### Development Security
- Default credentials are for development only
- Don't expose containers to public networks
- Use environment files for sensitive data

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)