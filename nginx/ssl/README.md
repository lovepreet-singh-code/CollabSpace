# SSL Certificate Directory

This directory is for storing SSL/TLS certificates for HTTPS support.

## Development Setup (Self-Signed Certificate)

Generate a self-signed certificate for local development:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx-selfsigned.key \
  -out nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=CollabSpace/CN=localhost"
```

This will create:
- `nginx-selfsigned.crt` - Certificate file
- `nginx-selfsigned.key` - Private key file

**Note**: Self-signed certificates will show security warnings in browsers. This is normal for development.

## Production Setup (Let's Encrypt)

For production, use Let's Encrypt for free, trusted SSL certificates:

### Option 1: Using Certbot Docker Image

```bash
# Run certbot to obtain certificate
docker run -it --rm \
  -v $(pwd)/nginx/ssl:/etc/letsencrypt \
  -v $(pwd)/nginx/webroot:/var/www/html \
  certbot/certbot certonly \
  --webroot -w /var/www/html \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos
```

### Option 2: Using Certbot on Host

```bash
# Install certbot
sudo apt-get install certbot  # Ubuntu/Debian
# or
brew install certbot  # macOS

# Obtain certificate
sudo certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up auto-renewal:

```bash
# Add to crontab (run daily at midnight)
0 0 * * * certbot renew --quiet && docker compose restart nginx
```

## Certificate Files

After setup, this directory should contain:

- `nginx-selfsigned.crt` or `fullchain.pem` - Public certificate
- `nginx-selfsigned.key` or `privkey.pem` - Private key
- `chain.pem` (optional) - Certificate chain
- `dhparam.pem` (optional) - Diffie-Hellman parameters for enhanced security

## Generate DH Parameters (Optional, for Enhanced Security)

```bash
openssl dhparam -out nginx/ssl/dhparam.pem 2048
```

Then add to your SSL configuration:

```nginx
ssl_dhparam /etc/nginx/ssl/dhparam.pem;
```

## Security Best Practices

1. **Never commit private keys** to version control
2. **Set proper file permissions**:
   ```bash
   chmod 600 nginx/ssl/*.key
   chmod 644 nginx/ssl/*.crt
   ```
3. **Use strong key sizes** (minimum 2048-bit RSA)
4. **Rotate certificates** before expiration
5. **Monitor certificate expiration** dates
6. **Use modern TLS protocols** (TLSv1.2, TLSv1.3)

## Verify Certificate

```bash
# Check certificate details
openssl x509 -in nginx/ssl/nginx-selfsigned.crt -noout -text

# Check certificate expiration
openssl x509 -in nginx/ssl/nginx-selfsigned.crt -noout -dates

# Verify certificate and key match
openssl x509 -noout -modulus -in nginx/ssl/nginx-selfsigned.crt | openssl md5
openssl rsa -noout -modulus -in nginx/ssl/nginx-selfsigned.key | openssl md5
# The MD5 hashes should match
```

## Test SSL Configuration

```bash
# Test SSL connection
openssl s_client -connect localhost:443 -servername localhost

# Check SSL configuration (online tool)
# https://www.ssllabs.com/ssltest/
```

## Troubleshooting

### Certificate Not Found Error

```
nginx: [emerg] cannot load certificate "/etc/nginx/ssl/nginx-selfsigned.crt": BIO_new_file() failed
```

**Solution**: Ensure certificate files exist and paths in `ssl.conf` are correct.

### Permission Denied Error

```
nginx: [emerg] BIO_new_file("/etc/nginx/ssl/nginx-selfsigned.key") failed (SSL: error:0200100D:system library:fopen:Permission denied)
```

**Solution**: Fix file permissions:
```bash
chmod 644 nginx/ssl/*.crt
chmod 600 nginx/ssl/*.key
```

### Certificate Expired

**Solution**: Renew certificate:
```bash
# For Let's Encrypt
certbot renew

# For self-signed
# Regenerate with new expiration date
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx-selfsigned.key \
  -out nginx/ssl/nginx-selfsigned.crt
```
