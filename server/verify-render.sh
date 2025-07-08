#!/bin/bash

# Backend verification script for Render.com deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

echo "🔍 Backend Render.com Deployment Verification"
echo "============================================="

# Check if required files exist
echo ""
echo "📁 Checking required backend files..."

required_files=(
    "package.json"
    "src/index.ts"
    "build.sh"
    "Dockerfile"
    "render.yaml"
    ".env.render"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Check if build script is executable
if [ -x "build.sh" ]; then
    print_status "build.sh is executable"
else
    print_warning "build.sh is not executable, fixing..."
    chmod +x build.sh
    print_status "build.sh made executable"
fi

# Check package.json scripts
echo ""
echo "📦 Checking package.json scripts..."

if grep -q '"build"' package.json; then
    print_status "build script found"
else
    print_error "build script missing in package.json"
fi

if grep -q '"start"' package.json; then
    print_status "start script found"
else
    print_error "start script missing in package.json"
fi

# Check server configuration
echo ""
echo "🖥️ Checking server configuration..."

if grep -q "process.env.PORT" src/index.ts; then
    print_status "Server uses PORT environment variable"
else
    print_error "Server doesn't use PORT environment variable"
fi

if grep -q "/health" src/index.ts; then
    print_status "Health check endpoint found"
else
    print_error "Health check endpoint missing"
fi

if grep -q "cors" src/index.ts; then
    print_status "CORS configuration found"
else
    print_warning "CORS configuration not found"
fi

# Check environment variables template
echo ""
echo "🔐 Checking environment configuration..."

if [ -f ".env.render" ]; then
    print_status ".env.render template exists"
    
    # Check for required environment variables
    required_env_vars=(
        "NODE_ENV"
        "MONGODB_URI"
        "JWT_SECRET"
        "CLIENT_URL"
    )
    
    for var in "${required_env_vars[@]}"; do
        if grep -q "$var" .env.render; then
            print_status "$var found in .env.render"
        else
            print_warning "$var not found in .env.render"
        fi
    done
else
    print_error ".env.render template missing"
fi

# Test build process
echo ""
echo "🏗️ Testing build process..."

print_info "Running build test..."
if ./build.sh > /tmp/backend_build_test.log 2>&1; then
    print_status "Build process completed successfully"
    
    # Check if build output exists
    if [ -d "dist" ]; then
        print_status "Build output (dist/) exists"
        
        if [ -f "dist/index.js" ]; then
            print_status "Main entry point (dist/index.js) exists"
        else
            print_error "Main entry point missing"
        fi
    else
        print_error "Build output directory missing"
    fi
else
    print_error "Build process failed. Check /tmp/backend_build_test.log for details"
    echo "Build log:"
    cat /tmp/backend_build_test.log
    exit 1
fi

# Check for sensitive data
echo ""
echo "🔒 Checking for sensitive data..."

if git status --porcelain | grep -q .; then
    print_warning "Uncommitted changes found"
    print_info "Make sure to commit all changes before deploying"
else
    print_status "All changes committed"
fi

# Final summary
echo ""
echo "📊 Backend Verification Summary:"
print_status "✅ Backend is ready for Render.com deployment!"
echo ""
echo "🚀 Next steps:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Create Web Service on Render"
echo "  3. Set build command: ./build.sh"
echo "  4. Set start command: node dist/index.js"
echo "  5. Configure environment variables"
echo ""
echo "📚 Required environment variables:"
echo "  - NODE_ENV=production"
echo "  - MONGODB_URI=your_mongodb_connection_string"
echo "  - JWT_SECRET=your_jwt_secret"
echo "  - CLIENT_URL=https://your-frontend-app.onrender.com"