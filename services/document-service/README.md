# Document Service - CollabSpace

## Run locally
1. cp .env.example .env
2. npm install
3. npm run dev

## APIs
- POST /api/documents                create doc
- GET  /api/documents                list user docs
- GET  /api/documents/:id            get doc
- PUT  /api/documents/:id            update doc (editor)
- DELETE /api/documents/:id          delete doc (owner only)
- POST /api/documents/:id/share      create share token
- POST /api/documents/:id/collaborators  add collaborator (owner)
- DELETE /api/documents/:id/collaborators/:userId  remove collaborator (owner)
