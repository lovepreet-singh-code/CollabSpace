# CollabSpace API Testing Guide

This guide explains how to use the Postman collection to test all CollabSpace services through the Nginx reverse proxy.

## Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `collabspace_complete.postman_collection.json`
   - `CollabSpace.postman_environment.json`
4. Select **CollabSpace Environment** from the environment dropdown

### 2. Start Services

Ensure all services are running:
```bash
docker compose up -d
```

Verify services are healthy:
```bash
docker compose ps
```

### 3. Test Authentication Flow

Run these requests in order:

1. **Register User** - Creates a new user account
2. **Login** - Authenticates and saves JWT token automatically
3. **Get Current User** - Verifies authentication works

The JWT token is automatically saved to the environment and used for all subsequent requests.

### 4. Test Document Workflow

1. **Create Document** - Document ID is auto-saved
2. **List Documents** - View all your documents
3. **Get Document** - Retrieve specific document
4. **Update Document** - Modify document content
5. **Add Collaborator** - Share with other users
6. **Generate Share Link** - Create public share link

### 5. Test Comments

1. **Create Comment Thread** - Add comment to document
2. **Reply to Comment** - Add reply to thread
3. **Get Comments for Document** - View all comments
4. **Resolve Thread** - Mark discussion as resolved

### 6. Test Versions

1. **Get Version History** - View document versions
2. **Restore Version** - Rollback to previous version

### 7. Test Notifications

1. **List Notifications** - View all notifications
2. **Mark as Read** - Mark notification as read
3. **Mark All as Read** - Clear all notifications

## Environment Variables

The collection uses these variables (auto-populated by test scripts):

| Variable | Description | Default Value | Auto-Set |
|----------|-------------|---------------|----------|
| `base_url` | Nginx reverse proxy URL | `http://localhost` | Manual |
| `gateway_url` | Direct gateway URL (alternative) | `http://localhost:8000` | Manual |
| `ws_url` | WebSocket URL via Nginx | `ws://localhost/ws` | Manual |
| `ws_direct_url` | Direct WebSocket URL | `ws://localhost:4003` | Manual |
| `auth_token` | JWT authentication token | - | ✓ |
| `user_id` | Current user ID | - | ✓ |
| `document_id` | Last created document ID | - | ✓ |
| `comment_id` | Last created comment ID | - | ✓ |
| `version_id` | Last version ID | - | ✓ |

## Collection Features

### Automatic Authentication
- JWT token is automatically extracted from login response
- Token is automatically added to all protected requests
- No manual header configuration needed

### Auto-Save IDs
- Test scripts automatically save IDs from responses
- Use `{{document_id}}`, `{{comment_id}}`, etc. in subsequent requests
- Enables seamless workflow testing

### Test Scripts
Each request includes test scripts that:
- Validate response status codes
- Extract and save important IDs
- Verify response structure

## API Endpoints Overview

### 1. Authentication (5 endpoints)
- Register, Login, Get Profile, Grant/Revoke Roles

### 2. Documents (8 endpoints)
- CRUD operations, Collaborator management, Share links

### 3. Comments (6 endpoints)
- Thread creation, Replies, Resolution

### 4. Versions (2 endpoints)
- History viewing, Version restoration

### 5. Notifications (4 endpoints)
- List, Mark read, Delete

### 6. Collaboration (WebSocket)
- Real-time editing via Y.js
- Connection via Nginx: `ws://localhost/ws/:docName` (recommended)
- Direct connection: `ws://localhost:4003/:docName` (alternative)

## Running Collection Tests

### Run Entire Collection
1. Click **Collections** in sidebar
2. Click **CollabSpace Complete API**
3. Click **Run** button
4. Select **CollabSpace Environment**
5. Click **Run CollabSpace Complete API**

### Run Individual Folders
- Right-click any folder (e.g., "2. Documents")
- Click **Run folder**
- Review results

## Troubleshooting

### Authentication Errors
- Ensure you've run **Login** request first
- Check `auth_token` is set in environment
- Verify services are running: `docker compose ps`

### Connection Refused
- Verify nginx is running on port 80: `docker compose ps nginx`
- Verify gateway is running on port 8000: `docker compose ps gateway-service`
- Check `base_url` in environment variables (should be `http://localhost`)
- Ensure all services are healthy: `docker compose ps`
- Test nginx health: `curl http://localhost/nginx-health`

### Missing IDs
- Run requests in order (Register → Login → Create Document)
- Check environment variables are being set
- Review test script output

## WebSocket Testing

For real-time collaboration testing, use a WebSocket client:

**Via Nginx (Recommended):**
```javascript
const ws = new WebSocket('ws://localhost/ws/my-document');

ws.onopen = () => {
  console.log('Connected via Nginx!');
};

ws.onmessage = (event) => {
  console.log('Received update:', event.data);
};
```

**Direct Connection (Alternative):**
```javascript
const ws = new WebSocket('ws://localhost:4003/my-document');
```

Or use browser extensions like:
- Simple WebSocket Client
- WebSocket King

## Service Ports

| Service | Port | Access |
|---------|------|--------|
| **Nginx (Reverse Proxy)** | **80/443** | **✓ Recommended** |
| Gateway | 8000 | ✓ Alternative |
| User Service | 4001 | Debug only |
| Document Service | 4002 | Debug only |
| Collaboration Service | 4003 | Debug/WebSocket |
| Version Service | 4004 | Debug only |
| Notification Service | 4005 | Debug only |
| Comment Service | 4006 | Debug only |

**Note:** Use Nginx (port 80) for all API testing. It provides rate limiting, security headers, and load balancing. Direct service access is available for debugging.

## Next Steps

1. Import the collection and environment
2. Start all services with `docker compose up -d`
3. Run the authentication requests
4. Explore the full API workflow
5. Customize requests for your use case

Happy testing! 🚀
