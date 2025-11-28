# CollabSpace - Real-time Collaborative Document Platform

A microservices-based collaborative document editing platform with real-time synchronization, version control, comments, and notifications.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Postman (for API testing)

### Start All Services

```bash
docker compose up --build -d
```

This will start all 13 containers:
- **Infrastructure**: MongoDB, Redis, Kafka, Zookeeper
- **Services**: User, Document, Collaboration, Version, Notification, Comment, Gateway
- **Reverse Proxy**: Nginx

### Verify Services

```bash
docker compose ps
```

All services should show as "Up" and healthy.

## 📡 API Testing with Postman

### Import Collection

1. **Download Postman Collection**
   - [CollabSpace Complete API Collection](./collabspace_complete.postman_collection.json)
   - [CollabSpace Environment Variables](./CollabSpace.postman_environment.json)

2. **Import into Postman**
   - Open Postman
   - Click **Import**
   - Select both JSON files
   - Choose **CollabSpace Environment** from dropdown

3. **Start Testing**
   - Run **Register User** → **Login**
   - JWT token is auto-saved
   - Test any endpoint - authentication is automatic!

### Collection Features

✅ **30+ Endpoints** across 6 services  
✅ **Auto-authentication** with JWT token management  
✅ **Auto-save IDs** for seamless workflow testing  
✅ **Test scripts** for response validation  
✅ **Environment variables** for easy configuration  

📖 **[Complete Testing Guide](./POSTMAN_GUIDE.md)**

## 🏗️ Architecture

### Microservices

| Service | Port | Description |
|---------|------|-------------|
| **Nginx** | 80/443 | Reverse proxy - main entry point |
| **Gateway** | 8000 | API Gateway - routes to microservices |
| **User Service** | 4001 | Authentication & user management |
| **Document Service** | 4002 | Document CRUD & sharing |
| **Collaboration Service** | 4003 | Real-time editing (WebSocket/Y.js) |
| **Version Service** | 4004 | Version history & restore |
| **Notification Service** | 4005 | User notifications |
| **Comment Service** | 4006 | Comments & discussions |

### Infrastructure

- **MongoDB** (27017) - Primary database
- **Redis** (6379) - Caching & pub/sub
- **Kafka** (9092) - Event streaming
- **Zookeeper** (2181) - Kafka coordination

## 🔑 API Endpoints

All requests go through **Nginx** at `http://localhost` (port 80), which proxies to the API Gateway.

> **Note**: You can still access the gateway directly at `http://localhost:8000` if needed.

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login & get JWT token
GET    /api/auth/me            - Get current user
POST   /api/auth/role/grant    - Grant role (admin)
POST   /api/auth/role/revoke   - Revoke role (admin)
```

### Documents
```
POST   /api/documents                        - Create document
GET    /api/documents                        - List documents
GET    /api/documents/:id                    - Get document
PUT    /api/documents/:id                    - Update document
DELETE /api/documents/:id                    - Delete document
POST   /api/documents/:id/collaborators      - Add collaborator
DELETE /api/documents/:id/collaborators/:uid - Remove collaborator
POST   /api/documents/:id/share              - Generate share link
```

### Comments
```
POST   /api/comments              - Create comment thread
POST   /api/comments/reply        - Reply to comment
GET    /api/comments/:docId       - Get comments
DELETE /api/comments/:id          - Delete comment
POST   /api/comments/:id/resolve  - Resolve thread
POST   /api/comments/:id/unresolve - Unresolve thread
```

### Versions
```
GET    /api/versions/:docName           - Get version history
POST   /api/versions/restore/:versionId - Restore version
```

### Notifications
```
GET    /api/notifications            - List notifications
POST   /api/notifications/mark-read  - Mark as read
POST   /api/notifications/mark-all-read - Mark all as read
DELETE /api/notifications/:id       - Delete notification
```

### Collaboration (WebSocket)
```
ws://localhost/ws/:docName - Real-time editing (via Nginx)
ws://localhost:4003/:docName - Direct connection (alternative)
```

## 🧪 Testing Workflow

### 1. Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "name": "Alice Johnson"
}

# Login (saves JWT token)
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

### 2. Create & Manage Documents
```bash
# Create document (saves document_id)
POST /api/documents
{
  "title": "Project Proposal",
  "content": "Initial draft...",
  "tags": ["proposal", "draft"]
}

# Update document
PUT /api/documents/:id
{
  "title": "Project Proposal - Final",
  "content": "Updated content..."
}
```

### 3. Add Comments
```bash
# Create comment thread
POST /api/comments
{
  "docId": "{{document_id}}",
  "content": "Needs more detail here",
  "position": { "line": 42, "column": 10 }
}

# Reply to comment
POST /api/comments/reply
{
  "threadId": "{{comment_id}}",
  "content": "I'll add more details"
}
```

## 🛠️ Development

### Project Structure
```
CollabSpace/
├── services/
│   ├── user-service/
│   ├── document-service/
│   ├── collaboration-service/
│   ├── version-service/
│   ├── notification-service/
│   ├── comment-service/
│   └── gateway-service/
├── nginx/                           # Nginx configuration
│   ├── nginx.conf                   # Main nginx config
│   ├── conf.d/                      # Additional configs
│   ├── ssl/                         # SSL certificates
│   └── README.md                    # Nginx documentation
├── common/                          # Shared utilities
├── docker-compose.yml               # Service orchestration
├── collabspace_complete.postman_collection.json
├── CollabSpace.postman_environment.json
└── POSTMAN_GUIDE.md
```

### Environment Variables

Each service uses environment variables for configuration. See individual service `.env.example` files.

### Local Development

Run individual services:
```bash
cd services/user-service
npm install
npm run dev
```

## 📚 Documentation

- **[Nginx Configuration Guide](./nginx/README.md)** - Reverse proxy setup and configuration
- **[Postman Testing Guide](./POSTMAN_GUIDE.md)** - Complete API testing guide
- **[Postman Collection](./collabspace_complete.postman_collection.json)** - Import into Postman
- **[Environment Variables](./CollabSpace.postman_environment.json)** - Postman environment

## 🔧 Troubleshooting

### Services Not Starting
```bash
# Check logs
docker compose logs -f [service-name]

# Restart services
docker compose restart

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### Authentication Errors
- Ensure you've run the **Login** request
- Check `auth_token` is set in Postman environment
- Verify JWT token hasn't expired (7 days default)

### Connection Refused
- Verify nginx is running: `docker compose ps nginx`
- Verify gateway is running: `docker compose ps gateway-service`
- Check port 80 is not in use: `netstat -ano | findstr :80`
- Ensure all dependencies are healthy

### Nginx Errors
- Test nginx config: `docker compose exec nginx nginx -t`
- Check nginx logs: `docker compose logs nginx`
- Verify nginx health: `curl http://localhost/nginx-health`

## 🌟 Features

- ✅ **Microservices Architecture** - Scalable and maintainable
- ✅ **Real-time Collaboration** - Y.js CRDT for conflict-free editing
- ✅ **Version Control** - Complete document history
- ✅ **Comments & Discussions** - Threaded comments with resolution
- ✅ **Notifications** - Real-time user notifications
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Nginx Reverse Proxy** - Load balancing, SSL/TLS, rate limiting
- ✅ **API Gateway** - Service routing and orchestration
- ✅ **Event-Driven** - Kafka for async communication
- ✅ **Caching** - Redis for performance
- ✅ **Containerized** - Docker for easy deployment

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using Node.js, TypeScript, MongoDB, Redis, Kafka, and Y.js**
