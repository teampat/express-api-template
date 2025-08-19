# Docker Deployment Guide

This project provides multiple Docker configurations for different runtimes and environments.

## 🐳 Available Docker Configurations

### 1. Node.js Runtime
- **Dockerfile**: `Dockerfile.nodejs`
- **Docker Compose**: `docker-compose.nodejs.yml`
- **Use case**: Production deployment with Node.js

### 2. Bun Runtime
- **Dockerfile**: `Dockerfile.bun`
- **Docker Compose**: `docker-compose.bun.yml`
- **Use case**: Production deployment with Bun (faster performance)

### 3. Development Environment
- **Docker Compose**: `docker-compose.dev.yml`
- **Use case**: Local development with hot reload

## 🚀 Quick Start

### Production with Node.js
```bash
# Build and start services
docker-compose -f docker-compose.nodejs.yml up -d

# View logs
docker-compose -f docker-compose.nodejs.yml logs -f api

# Stop services
docker-compose -f docker-compose.nodejs.yml down
```

### Production with Bun
```bash
# Build and start services
docker-compose -f docker-compose.bun.yml up -d

# View logs
docker-compose -f docker-compose.bun.yml logs -f api

# Stop services
docker-compose -f docker-compose.bun.yml down
```

### Development Environment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api-dev

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🔧 Environment Variables

Create a `.env` file for production deployments:

```env
# Database
DB_DIALECT=mysql
DB_HOST=mysql
DB_PORT=3306
DB_NAME=express_api
DB_USERNAME=root
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload
UPLOAD_STORAGE=local
UPLOAD_PATH=uploads/

# Email
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email
EMAIL_PASS=your-password

# S3 (Optional)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=uploads
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_FORCE_PATH_STYLE=true
```

## 🛠️ Services Included

### Core Services
- **API**: Express.js application (Node.js or Bun)
- **MySQL**: Database server
- **Redis**: Caching (optional)

### Development/Testing Services
- **MailHog**: Email testing (http://localhost:8025)
- **MinIO**: S3-compatible storage (http://localhost:9001)

## 📊 Health Checks

Health checks are configured in Docker Compose (not in Dockerfiles):
- **API**: HTTP check on `/health` endpoint using curl
- **MySQL**: mysqladmin ping
- **Redis**: redis-cli ping

The API health check waits 40 seconds for startup and then checks every 30 seconds.

## 🔄 Database Migration

Run migrations after containers are up:

```bash
# Node.js version
docker-compose -f docker-compose.nodejs.yml exec api npm run migrate

# Bun version
docker-compose -f docker-compose.bun.yml exec api bun run migrate
```

## 📈 Monitoring

### View Service Status
```bash
docker-compose -f docker-compose.nodejs.yml ps
```

### View Resource Usage
```bash
docker stats
```

### Access Container Shell
```bash
# Node.js container
docker-compose -f docker-compose.nodejs.yml exec api sh

# Bun container
docker-compose -f docker-compose.bun.yml exec api sh
```

### 🔒 Security Features

- Non-root user in containers
- Network isolation
- External health checks via Docker Compose
- Volume mounts for persistent data

## 📝 Notes

- **Node.js**: Traditional, stable, wide ecosystem support
- **Bun**: Faster performance, smaller image size, newer technology
- **Development**: Uses SQLite for simplicity, includes hot reload
- **Production**: Uses MySQL for better performance and reliability

Choose the configuration that best fits your deployment needs!
