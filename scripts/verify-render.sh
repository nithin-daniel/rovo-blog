#!/bin/bash

# Verification script for Render.com deployment readiness

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

echo "🔍 Render.com Deployment Verification"
echo "====================================="

# Check if required files exist
echo ""
echo "📁 Checking required files..."

required_files=(
    "package.json"
    "server/package.json"
    "client/package.json"
    "server/src/index.ts"
    "build.sh"
    "RENDER_DEPLOYMENT.md"
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

# Check Node.js version
echo ""
echo "🔧 Checking Node.js version..."
NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" =~ ^v1[8-9]\. ]] || [[ "$NODE_VERSION" =~ ^v[2-9][0-9]\. ]]; then
    print_status "Node.js version is compatible with Render"
else
    print_warning "Node.js version might not be optimal. Render recommends Node 18+"
fi

# Check package.json scripts
echo ""
echo "📦 Checking package.json scripts..."

if grep -q '"build:render"' package.json; then
    print_status "build:render script found"
else
    print_error "build:render script missing"
fi

if grep -q '"start:render"' package.json; then
    print_status "start:render script found"
else
    print_error "start:render script missing"
fi

# Check server configuration
echo ""
echo "🖥️ Checking server configuration..."

if grep -q "process.env.PORT" server/src/index.ts; then
    print_status "Server uses PORT environment variable"
else
    print_error "Server doesn't use PORT environment variable"
fi

if grep -q "express.static" server/src/index.ts; then
    print_status "Server serves static files"
else
    print_error "Server doesn't serve static files"
fi

if grep -q "/health" server/src/index.ts; then
    print_status "Health check endpoint found"
else
    print_error "Health check endpoint missing"
fi

# Check client build configuration
echo ""
echo "🌐 Checking client configuration..."

if [ -f "client/vite.config.ts" ]; then
    print_status "Vite configuration found"
elif [ -f "client/webpack.config.js" ]; then
    print_status "Webpack configuration found"
else
    print_warning "No build configuration found"
fi

# Test build process
echo ""
echo "🏗️ Testing build process..."

print_info "Running build test..."
if ./build.sh > /tmp/build_test.log 2>&1; then
    print_status "Build process completed successfully"
    
    # Check if build outputs exist
    if [ -d "client/dist" ]; then
        print_status "Client build output exists"
    else
        print_error "Client build output missing"
    fi
    
    if [ -d "server/dist" ]; then
        print_status "Server build output exists"
    else
        print_error "Server build output missing"
    fi
else
    print_error "Build process failed. Check /tmp/build_test.log for details"
    echo "Build log:"
    cat /tmp/build_test.log
    exit 1
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

# Check for sensitive data in repository
echo ""
echo "🔒 Checking for sensitive data..."

sensitive_patterns=(
    "password"
    "secret"
    "key"
    "token"
)

for pattern in "${sensitive_patterns[@]}"; do
    if git ls-files | xargs grep -l "$pattern" | grep -v ".md\|.example\|.render" > /dev/null 2>&1; then
        print_warning "Potential sensitive data found containing '$pattern'"
        print_info "Make sure no actual secrets are committed to Git"
    fi
done

# Check Git status
echo ""
echo "📝 Checking Git status..."

if git status --porcelain | grep -q .; then
    print_warning "Uncommitted changes found"
    print_info "Make sure to commit all changes before deploying"
    git status --short
else
    print_status "All changes committed"
fi

# Final recommendations
echo ""
echo "📋 Render.com Deployment Checklist:"
echo ""
echo "Before deploying to Render:"
echo "  1. Create MongoDB Atlas cluster"
echo "  2. Set up Redis (optional)"
echo "  3. Prepare environment variables"
echo "  4. Push code to GitHub"
echo "  5. Create Render web service"
echo "  6. Configure environment variables in Render"
echo "  7. Deploy and monitor"
echo ""

# Summary
echo "📊 Verification Summary:"
if [ -d "client/dist" ] && [ -d "server/dist" ]; then
    print_status "✅ Your application is ready for Render.com deployment!"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Push to GitHub: git push origin main"
    echo "  2. Follow RENDER_DEPLOYMENT.md guide"
    echo "  3. Create service on render.com"
    echo ""
    echo "📚 Useful commands:"
    echo "  npm run build:render  - Build for Render"
    echo "  npm run start:render  - Start in production mode"
    echo ""
else
    print_error "❌ Build verification failed. Please fix issues above."
    exit 1
fi