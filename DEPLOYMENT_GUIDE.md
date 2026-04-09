# Deployment & Operations Guide

## 🚀 Deployment Preparation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- SQLite 3 (usually included with Node.js)
- 100MB disk space for database and node_modules

### Pre-Deployment Checklist

- [ ] Review `.env.local` configuration
- [ ] Set strong `ENCRYPTION_KEY` value
- [ ] Test database connection: `npx prisma db validate`
- [ ] Run full test suite (see Testing section)
- [ ] Build successfully: `npm run build`
- [ ] Run linting: `npm run lint`

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Steps
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Set environment variables:
   - `DATABASE_URL`: Point to hosted database (or use Vercel's SQLite support)
   - `ENCRYPTION_KEY`: Set your encryption key
4. Deploy automatically on push

#### Limitations
- SQLite not ideal for production on serverless
- Consider PostgreSQL for production

### Option 2: Self-Hosted (Linux/Ubuntu)

#### Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo> hr-attendance
cd hr-attendance

# Install dependencies
npm ci  # Use npm ci for production

# Configure environment
sudo nano .env.local
# Set DATABASE_URL, ENCRYPTION_KEY, etc.

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "hr-attendance" -- start
pm2 save
pm2 startup
```

#### Port Configuration
```bash
# Application runs on port 3000 (configurable)
# Use nginx as reverse proxy for SSL/HTTPS
```

### Option 3: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "file:./dev.db"
      ENCRYPTION_KEY: "${ENCRYPTION_KEY}"
    volumes:
      - ./prisma:/app/prisma
      - ./dev.db:/app/dev.db
```

#### Deploy
```bash
docker-compose up -d
```

---

## 🔧 Environment Configuration

### .env.local Template
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key-here!!!!"

# Node Environment
NODE_ENV="production"

# Server Port (optional)
PORT=3000

# Database Connection Timeout (optional)
DATABASE_TIMEOUT=15000
```

### ENCRYPTION_KEY Generation
```bash
# Generate a secure 32+ character key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Database Management

### Production Database Setup

#### Option 1: SQLite (Good for small-medium scale)
```bash
# Already configured in the system
# Database file: prisma/dev.db
# Backup database regularly
```

#### Option 2: PostgreSQL (Recommended for enterprise)
```sql
-- Create database
CREATE DATABASE hr_attendance;

-- Create user
CREATE USER hr_admin WITH PASSWORD 'secure_password';
ALTER USER hr_admin WITH LOGIN;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hr_attendance TO hr_admin;
```

Update schema.prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update .env:
```
DATABASE_URL="postgresql://hr_admin:password@localhost:5432/hr_attendance"
```

### Database Migrations

```bash
# Run migrations
npx prisma migrate deploy

# Create backup
cp prisma/dev.db prisma/dev.db.backup

# Reset database (development only)
npx prisma migrate reset
```

---

## 🔐 Security Hardening

### 1. HTTPS/SSL Setup
```bash
# Using Let's Encrypt with certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx to use SSL
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 2. Nginx Reverse Proxy
```nginx
upstream hr_attendance {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration here...

    client_max_body_size 10M;

    location / {
        proxy_pass http://hr_attendance;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Firewall Configuration
```bash
# UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. System Hardening
```bash
# Disable unnecessary services
sudo systemctl disable avahi-daemon
sudo systemctl disable cups

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## 📈 Monitoring & Logging

### Application Logging
```bash
# View logs with PM2
pm2 logs hr-attendance

# View logs with Docker
docker-compose logs -f app

# Persistent logging to file with PM2
pm2 start npm --name "hr-attendance" -- start --output ./logs/out.log --error ./logs/error.log
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop
sudo apt install iotop

# Real-time monitoring
htop

# Database size
du -h prisma/dev.db

# Disk usage
df -h
```

### Application Health Checks
```bash
# Add health check endpoint (for future implementation)
# GET /api/health → Returns { status: "ok" }

# Monitor with curl
while true; do
    curl -f http://localhost:3000/api/health || send_alert
    sleep 60
done
```

---

## 🔄 Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# File: backup.sh

BACKUP_DIR="/backups/hr-attendance"
DB_FILE="/app/prisma/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp $DB_FILE $BACKUP_DIR/db_backup_$DATE.db

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.db" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.db"
```

Schedule with crontab:
```bash
crontab -e
# Add: 0 2 * * * /app/backup.sh  # Daily at 2 AM
```

### Recovery Procedure
```bash
# Stop application
pm2 stop hr-attendance

# Restore from backup
cp prisma/dev.db.backup prisma/dev.db

# Start application
pm2 start hr-attendance

# Verify
curl http://localhost:3000
```

---

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Analyze index effectiveness
PRAGMA index_list(Employee);

-- Rebuild indexes
REINDEX;

-- Vacuum database
VACUUM;
```

### 2. Application Optimization
```javascript
// Next.js optimization in next.config.ts
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    unoptimized: false,
  },
  
  // Enable incremental static regeneration
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  }
};
```

### 3. Caching Strategy
```bash
# Browser caching headers configured in nginx
# API responses cached appropriately
# Static assets cached for 1 year
```

---

## 🚨 Incident Response

### Issue: Application won't start
```bash
# Check logs
pm2 logs hr-attendance

# Check environment variables
cat .env.local

# Verify database
npx prisma status

# Rebuild
npm run build

# Restart
pm2 restart hr-attendance
```

### Issue: Database corruption
```bash
# Backup current database
cp prisma/dev.db prisma/dev.db.corrupted

# Reset from backup
cp prisma/dev.db.backup prisma/dev.db

# Run migrations
npx prisma migrate deploy

# Restart
pm2 restart hr-attendance
```

### Issue: High memory usage
```bash
# Check process memory
pm2 monit

# Check Node.js heap
node --max-old-space-size=4096 server.js

# Profile with clinic.js
npm install -g clinic
clinic doctor -- npm start
```

### Issue: Slow database queries
```bash
# Enable query logging
// Add to prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

# Analyze slow queries
npx prisma studio  # Visual query explorer
```

---

## 📋 Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check system resources (CPU, memory, disk)
- [ ] Verify database connection
- [ ] Test critical user workflows

### Weekly
- [ ] Review application logs
- [ ] Check for security updates
- [ ] Backup database
- [ ] Verify backup integrity

### Monthly
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Performance analysis
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Update dependencies: `npm audit`

### Quarterly
- [ ] Full system upgrade test
- [ ] Expansion planning
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Security assessment

---

## 🔐 SSL/TLS Certificate Management

### Auto-renewal with Let's Encrypt
```bash
# Install renewal script
sudo certbot renew --dry-run  # Test first

# Automatic renewal via cron
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Monitor renewals
sudo certbot renew --force-renewal
```

---

## 📞 Support & Troubleshooting

### Log Files Location
```
Application: pm2 logs hr-attendance
System: /var/log/syslog
Database: Check Prisma logs in console
```

### Common Ports
- 3000: Application
- 80: HTTP (nginx)
- 443: HTTPS (nginx)
- 5432: PostgreSQL (if used)

### Useful Commands
```bash
# Check application status
pm2 status

# Restart application
pm2 restart hr-attendance

# View all logs
pm2 logs

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save
pm2 startup

# Stop application
pm2 stop hr-attendance

# Delete from PM2
pm2 delete hr-attendance
```

---

## 🎯 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Encryption key set and secure
- [ ] HTTPS/SSL configured
- [ ] Firewall configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Logging configured
- [ ] Health checks implemented
- [ ] Team trained on operations
- [ ] Documentation updated
- [ ] Disaster recovery plan documented

---

**Deployment Guide Version**: 1.0
**Last Updated**: February 28, 2026
**Recommended Hosting**: Vercel, AWS, or Self-Hosted Linux
