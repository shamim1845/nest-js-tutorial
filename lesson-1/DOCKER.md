# Docker Setup for NestJS Application

This document explains how to run the NestJS application using Docker.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Quick Start

### Production Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Update environment variables in `.env`:**
   - Change `JWT_SECRET` to a secure random string
   - Update database credentials if needed
   - Modify other settings as required

3. **Build and run the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - API: http://localhost:8000
   - Swagger Documentation: http://localhost:8000/api
   - Health Check: http://localhost:8000/health

### Development Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Run in development mode:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **For development with hot reload:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Docker Commands

### Basic Commands

```bash
# Build the application
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart a specific service
docker-compose restart app
```

### Development Commands

```bash
# Run in development mode
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up --build

# Access container shell
docker exec -it nestjs-app-dev sh
```

### Database Commands

```bash
# Access PostgreSQL shell
docker exec -it nestjs-postgres psql -U postgres -d nestjs_db

# Backup database
docker exec nestjs-postgres pg_dump -U postgres nestjs_db > backup.sql

# Restore database
docker exec -i nestjs-postgres psql -U postgres nestjs_db < backup.sql
```

## Services

### Application (app)
- **Container:** nestjs-app
- **Port:** 8000
- **Health Check:** Available at `/health`
- **Logs:** Available in `./logs` directory

### Database (postgres)
- **Container:** nestjs-postgres
- **Port:** 5432
- **Database:** nestjs_db
- **User:** postgres
- **Data Persistence:** postgres_data volume

### Redis (redis)
- **Container:** nestjs-redis
- **Port:** 6379
- **Data Persistence:** redis_data volume

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | production |
| `PORT` | Application port | 8000 |
| `DB_HOST` | Database host | postgres |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | nestjs_db |
| `DB_USER_NAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_SYNC` | Auto-sync database schema | false |
| `DB_AUTO_LOAD_ENTITIES` | Auto-load TypeORM entities | true |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 1h |

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify database is running
   docker-compose ps
   ```

3. **Application not starting:**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild the image
   docker-compose build --no-cache app
   ```

4. **Permission issues:**
   ```bash
   # Fix ownership of logs directory
   sudo chown -R $USER:$USER ./logs
   ```

### Health Checks

- **Application:** `curl http://localhost:8000/health`
- **Database:** `docker exec nestjs-postgres pg_isready -U postgres`
- **Redis:** `docker exec nestjs-redis redis-cli ping`

## Production Deployment

### Security Considerations

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets**
3. **Enable SSL/TLS** in production
4. **Configure proper CORS** settings
5. **Set up proper logging** and monitoring

### Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3

# Use load balancer (nginx) for multiple instances
```

### Monitoring

Consider adding:
- **Prometheus** for metrics
- **Grafana** for dashboards
- **ELK Stack** for logging
- **Health check endpoints** monitoring

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up everything
docker system prune -a
```
