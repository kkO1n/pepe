# Pepe Web

Next.js frontend for the Pepe backend.

## Local development

1. Start backend on port `3001`.
2. Start notifications-gateway on port `3002`.
3. In this directory install deps and run dev server:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

`next.config.ts` rewrites these paths to backend origin:

- `/auth/*`
- `/users/*`
- `/avatars/*`
- `/balances/*`
- `/notifications/*`
- `/api/*`

Env vars:

- `BACKEND_ORIGIN` for rewrite target (server-side).
- `NEXT_PUBLIC_NOTIFICATION_ORIGIN` for browser socket endpoint origin (defaults to `http://localhost:3001`).

## Production reverse proxy

Use same-domain proxy routing to send backend API paths to Nest, and all other requests to Next. See `nginx.example.conf`.
