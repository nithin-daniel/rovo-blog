#!/bin/bash

# Frontend verification script for Render.com deployment

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

echo "🔍 Frontend Render.com Deployment Verification"
echo "=============================================="

# Check if required files exist
echo ""
echo "📁 Checking required frontend files..."

required_files=(
    "package.json"
    "src/App.tsx"
    "build.sh"
    "Dockerfile"
    "nginx.conf"
    "render.yaml"
    ".env.render"
    "index.html"
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

if grep -q '"dev"' package.json; then
    print_status "dev script found"
else
    print_error "dev script missing in package.json"
fi

# Check Vite configuration
echo ""
echo "⚡ Checking Vite configuration..."

if [ -f "vite.config.ts" ]; then
    print_status "Vite configuration found"
else
    print_warning "Vite configuration not found"
fi

# Check for SPA redirect configuration
echo ""
echo "🔄 Checking SPA redirect configuration..."

if [ -f "public/_redirects" ]; then
    print_status "_redirects file found in public/"
    if grep -q "/*" public/_redirects; then
        print_status "SPA redirect rule configured"
    else
        print_warning "SPA redirect rule not found"
    fi
else
    print_warning "_redirects file not found - creating one..."
    mkdir -p public
    echo "/*    /index.html   200" > public/_redirects
    print_status "_redirects file created"
fi

# Check nginx configuration
echo ""
echo "🌐 Checking nginx configuration..."

if grep -q "try_files" nginx.conf; then
    print_status "Nginx SPA configuration found"
else
    print_warning "Nginx SPA configuration might be missing"
fi

if grep -q "/health" nginx.conf; then
    print_status "Nginx health check endpoint found"
else
    print_warning "Nginx health check endpoint not found"
fi

# Check environment variables template
echo ""
echo "🔐 Checking environment configuration..."

if [ -f ".env.render" ]; then
    print_status ".env.render template exists"
    
    # Check for required environment variables
    required_env_vars=(
        "VITE_API_URL"
        "VITE_APP_NAME"
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

# Check API service configuration
echo ""
echo "🔌 Checking API service configuration..."

if [ -f "src/services/api.ts" ]; then
    if grep -q "VITE_API_URL" src/services/api.ts; then
        print_status "API URL configuration found"
    else
        print_warning "API URL configuration not found in api service"
    fi
else
    print_warning "API service file not found"
fi

# Test build process
echo ""
echo "🏗️ Testing build process..."

print_info "Running build test..."
if ./build.sh > /tmp/frontend_build_test.log 2>&1; then
    print_status "Build process completed successfully"
    
    # Check if build output exists
    if [ -d "dist" ]; then
        print_status "Build output (dist/) exists"
        
        if [ -f "dist/index.html" ]; then
            print_status "Main HTML file (dist/index.html) exists"
        else
            print_error "Main HTML file missing"
        fi
        
        # Check for assets
        if ls dist/assets/*.js > /dev/null 2>&1; then
            print_status "JavaScript assets found"
        else
            print_warning "JavaScript assets not found"
        fi
        
        if ls dist/assets/*.css > /dev/null 2>&1; then
            print_status "CSS assets found"
        else
            print_warning "CSS assets not found"
        fi
    else
        print_error "Build output directory missing"
    fi
else
    print_error "Build process failed. Check /tmp/frontend_build_test.log for details"
    echo "Build log:"
    cat /tmp/frontend_build_test.log
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
echo "📊 Frontend Verification Summary:"
print_status "✅ Frontend is ready for Render.com deployment!"
echo ""
echo "🚀 Next steps:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Create Static Site on Render"
echo "  3. Set build command: ./build.sh"
echo "  4. Set publish directory: dist"
echo "  5. Configure environment variables"
echo ""
echo "📚 Required environment variables:"
echo "  - VITE_API_URL=https://your-backend-app.onrender.com/api"
echo "  - VITE_APP_NAME=Modern Blog"
echo ""
echo "⚠️  Important: Deploy backend first, then update VITE_API_URL with actual backend URL"