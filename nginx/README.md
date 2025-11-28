# Nginx Reverse Proxy for CollabSpace

This directory contains the nginx configuration for the CollabSpace microservices platform. Nginx serves as a reverse proxy, providing load balancing, SSL termination, rate limiting, and WebSocket support.

## Architecture

```
Client Request
     ↓
  Nginx (Port 80/443)
     ↓
  ├─→ /api/* → Gateway Service (Port 8000)
  │              ↓
  │   ┌──────────┼──────────┐
  │   ↓          ↓          ↓
  │   User    Document   Collaboration
  │   Service  Service    Service
  │   (4001)   (4002)     (4003)
  │
  └─→ /ws/* → Collaboration Service (Port 4003) [WebSocket]
```

## Configuration Files

### `nginx.conf`
Main nginx configuration file with:
- **Reverse Proxy**: Routes all `/api/*` requests to gateway service
- **WebSocket Support**: Direct `/ws/*` routing to collaboration service
- **Rate Limiting**: 
  - API endpoints: 100 requests/minute per IP
  - Auth endpoints: 20 requests/minute per IP
- **Security Headers**: XSS protection, clickjacking prevention, MIME sniffing protection
- **Gzip Compression**: Enabled for JSON, text, and JavaScript
- **Health Checks**: `/nginx-health` and `/health` endpoints
- **Error Handling**: Custom JSON error responses

### `conf.d/ssl.conf.example`
Example SSL/TLS configuration for HTTPS:
- Modern SSL protocols (TLSv1.2, TLSv1.3)
- Strong cipher suites
- HSTS headers
- OCSP stapling
- HTTP to HTTPS redirect

## Quick Start

### 1. Start with Docker Compose

```bash
# Start all services including nginx
docker compose up -d

# Check nginx status
docker compose ps nginx

# View nginx logs
docker compose logs -f nginx
```

### 2. Test the Setup

```bash
# Test nginx health
curl http://localhost/nginx-health

# Test gateway health through nginx
curl http://localhost/health

# Test API endpoint
curl http://localhost/api/auth/login
```

## SSL/TLS Setup

### Development (Self-Signed Certificate)

1. **Generate self-signed certificate**:
   ```bash
   # Create SSL directory
   mkdir -p nginx/ssl

   # Generate certificate
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/nginx-selfsigned.key \
     -out nginx/ssl/nginx-selfsigned.crt \
     -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

2. **Enable SSL configuration**:
   ```bash
   # Copy example config
   cp nginx/conf.d/ssl.conf.example nginx/conf.d/ssl.conf

   # Update docker-compose.yml to expose port 443
   # Restart nginx
   docker compose restart nginx
   ```

3. **Access via HTTPS**:
   ```bash
   curl -k https://localhost/health
   ```

### Production (Let's Encrypt)

1. **Install Certbot** in nginx container or use certbot/certbot image

2. **Obtain certificate**:
   ```bash
   certbot certonly --webroot -w /var/www/html \
     -d yourdomain.com -d www.yourdomain.com
   ```

3. **Update SSL configuration** in `ssl.conf`:
   ```nginx
   ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   ```

4. **Setup auto-renewal**:
   ```bash
   # Add to crontab
   0 0 * * * certbot renew --quiet && docker compose restart nginx
   ```

## Rate Limiting

### Current Limits

- **API Endpoints** (`/api/*`): 100 requests/minute per IP (burst: 20)
- **Auth Endpoints** (`/api/auth/*`): 20 requests/minute per IP (burst: 5)

### Customize Rate Limits

Edit `nginx.conf`:

```nginx
# Adjust rate (r/m = requests per minute, r/s = requests per second)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/m;

# Adjust burst size
location /api/ {
    limit_req zone=api_limit burst=50 nodelay;
    ...
}
```

### Test Rate Limiting

```bash
# Send rapid requests
for i in {1..150}; do curl http://localhost/api/auth/login; done

# You should see 429 (Too Many Requests) after hitting the limit
```

## Load Balancing

### Add Multiple Gateway Instances

1. **Scale gateway service**:
   ```bash
   docker compose up -d --scale gateway-service=3
   ```

2. **Nginx automatically distributes** requests using `least_conn` algorithm

3. **Monitor distribution**:
   ```bash
   # View nginx access logs to see upstream server selection
   docker compose logs nginx | grep upstream
   ```

### Configure Load Balancing Algorithm

Edit `nginx.conf` upstream block:

```nginx
upstream gateway_backend {
    # Options: round_robin (default), least_conn, ip_hash
    least_conn;
    
    server gateway-service:8000 weight=1 max_fails=3 fail_timeout=30s;
    # Add more servers if needed
    # server gateway-service-2:8000 weight=2;
    
    keepalive 32;
}
```

## WebSocket Configuration

### Direct WebSocket Connection

WebSocket connections to the collaboration service use the `/ws/*` path:

```javascript
// Connect to collaboration service via nginx
const ws = new WebSocket('ws://localhost/ws/document-name');

// Or with SSL
const ws = new WebSocket('wss://localhost/ws/document-name');
```

### WebSocket Timeouts

Current configuration allows long-lived connections:
- `proxy_connect_timeout`: 7 days
- `proxy_send_timeout`: 7 days
- `proxy_read_timeout`: 7 days

Adjust in `nginx.conf` if needed.

## Security Headers

Nginx adds the following security headers to all responses:

- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME sniffing
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filter
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **HSTS** (with SSL): `max-age=31536000` - Forces HTTPS

### Add Custom Headers

Edit `nginx.conf` server block:

```nginx
server {
    ...
    add_header X-Custom-Header "value" always;
    ...
}
```

## Performance Tuning

### Adjust Worker Processes

```nginx
# Auto-detect CPU cores (recommended)
worker_processes auto;

# Or set manually
worker_processes 4;
```

### Adjust Connection Limits

```nginx
events {
    worker_connections 2048;  # Increase for high traffic
    use epoll;
    multi_accept on;
}
```

### Adjust Buffer Sizes

```nginx
http {
    client_max_body_size 100M;  # Max upload size
    
    proxy_buffer_size 8k;
    proxy_buffers 16 8k;
    proxy_busy_buffers_size 16k;
}
```

### Enable Caching (Optional)

```nginx
# Add to http block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

# Add to location block
location /api/documents {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    ...
}
```

## Monitoring

### View Logs

```bash
# Access logs
docker compose logs nginx | grep "GET\|POST"

# Error logs
docker compose logs nginx | grep error

# Real-time logs
docker compose logs -f nginx
```

### Check Configuration

```bash
# Test nginx configuration syntax
docker compose exec nginx nginx -t

# Reload configuration without downtime
docker compose exec nginx nginx -s reload
```

### Health Checks

```bash
# Nginx health
curl http://localhost/nginx-health

# Gateway health through nginx
curl http://localhost/health

# Check response headers
curl -I http://localhost/api/auth/login
```

## Troubleshooting

### 502 Bad Gateway

**Cause**: Gateway service is not responding

**Solution**:
```bash
# Check gateway service status
docker compose ps gateway-service

# Check gateway logs
docker compose logs gateway-service

# Restart gateway
docker compose restart gateway-service
```

### 429 Too Many Requests

**Cause**: Rate limit exceeded

**Solution**:
- Wait for the rate limit window to reset (1 minute)
- Increase rate limits in `nginx.conf` if legitimate traffic
- Implement request queuing on client side

### WebSocket Connection Failed

**Cause**: WebSocket upgrade headers not properly configured

**Solution**:
```bash
# Check nginx logs for WebSocket errors
docker compose logs nginx | grep -i websocket

# Verify WebSocket path is correct: /ws/*
# Ensure collaboration service is running
docker compose ps collaboration-service
```

### Configuration Changes Not Applied

**Cause**: Nginx not reloaded after config changes

**Solution**:
```bash
# Test configuration first
docker compose exec nginx nginx -t

# Reload nginx
docker compose exec nginx nginx -s reload

# Or restart container
docker compose restart nginx
```

### SSL Certificate Errors

**Cause**: Invalid or expired certificate

**Solution**:
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/nginx-selfsigned.crt -noout -dates

# Regenerate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx-selfsigned.key \
  -out nginx/ssl/nginx-selfsigned.crt
```

## Advanced Configuration

### IP Whitelisting

```nginx
# Allow specific IPs only
location /api/admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    proxy_pass http://gateway_backend;
}
```

### Custom Error Pages

```nginx
# Serve custom HTML error pages
error_page 404 /404.html;
location = /404.html {
    root /usr/share/nginx/html;
    internal;
}
```

### Request/Response Modification

```nginx
# Add custom headers to upstream requests
location /api/ {
    proxy_set_header X-Custom-Header "value";
    proxy_pass http://gateway_backend;
}

# Hide upstream headers from response
proxy_hide_header X-Powered-By;
```

## Best Practices

1. **Always test configuration** before reloading: `nginx -t`
2. **Use SSL in production** with valid certificates
3. **Monitor logs regularly** for errors and suspicious activity
4. **Keep rate limits reasonable** to prevent abuse without blocking legitimate users
5. **Enable gzip compression** to reduce bandwidth
6. **Use keepalive connections** to reduce overhead
7. **Set appropriate timeouts** based on your application needs
8. **Implement health checks** for all upstream services
9. **Use least_conn** load balancing for better distribution
10. **Regular security updates** for nginx image

## Resources

- [Official Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Nginx SSL Configuration](https://ssl-config.mozilla.org/)
- [Let's Encrypt](https://letsencrypt.org/)
