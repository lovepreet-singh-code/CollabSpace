User Service for CollabSpace

Dev:
  cp .env.example .env
  npm install
  npm run dev

Build:
  npm run build
  npm start

APIs:
  POST /api/auth/register { email, password, name }
  POST /api/auth/login { email, password }
  GET  /api/auth/me  (Auth)
  POST /api/auth/role/grant { userId, docId, role } (Auth)
  POST /api/auth/role/revoke { userId, docId } (Auth)
