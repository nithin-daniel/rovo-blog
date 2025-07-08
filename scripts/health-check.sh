#!/bin/bash

# Health check script for Docker containers

echo "🏥 Health Check for Blog Application"
echo "===================================="

# Check if containers are running
echo "📋 Container Status:"
docker-compose ps 2>/dev/null || docker-compose -f docker-compose.dev.yml ps 2>/dev/null

echo ""
echo "🌐 Service Health Checks:"

# Check MongoDB
echo -n "MongoDB: "
if curl -s http://localhost:27017 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
fi

# Check Redis
echo -n "Redis: "
if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
fi

# Check Backend API
echo -n "Backend API: "
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
fi

# Check Frontend
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
fi

echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "No containers running"