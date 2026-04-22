# Pepe Web

Next.js frontend for the Pepe backend.

## Local development

1. Start backend on port `3001`.
2. In this directory install deps and run dev server:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000`.

`next.config.ts` rewrites these paths to backend origin:

- `/auth/*`
- `/users/*`
- `/avatars/*`
- `/balances/*`
- `/api/*`

Set `BACKEND_ORIGIN` if backend runs on a different host/port.

## Production reverse proxy

Use same-domain proxy routing to send backend API paths to Nest, and all other requests to Next. See `nginx.example.conf`.
