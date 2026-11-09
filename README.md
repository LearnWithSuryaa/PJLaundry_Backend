# PJLaundry Backend

REST API Express/TypeScript untuk aplikasi mobile PJLaundry dengan Supabase
sebagai database dan autentikasi.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
3. Install dependency: `npm install`.
4. Jalankan development server: `npm run dev`.

API tersedia di `http://localhost:3000/api/v1`. Health check:
`GET /api/v1/health`.

## Verifikasi

```bash
npm run typecheck
npm run build
npm test
```

## Deployment Render

- Root directory: repository root.
- Build command: `npm install && npm run build`.
- Start command: `npm start`.
- Set `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan
  `CORS_ORIGINS` pada environment Render.

Migration Supabase berada di `supabase/migrations`. Jalankan migration dan
seed melalui Supabase CLI atau SQL Editor sebelum menguji endpoint data.
