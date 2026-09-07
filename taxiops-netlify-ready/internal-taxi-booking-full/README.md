# Internal Taxi Booking — Netlify Ready

Aplikasi web internal untuk operasional taxi 4 hotel menggunakan Next.js, Prisma, dan PostgreSQL.

## Stack
- Next.js 15
- React 19
- TypeScript
- Prisma 6
- PostgreSQL
- Cookie/HMAC session authentication

## Deploy ke Netlify + PostgreSQL

### 1. Push repository ke GitHub

Pastikan seluruh folder project ini di-push ke repository GitHub.

### 2. Buat database PostgreSQL production

Gunakan PostgreSQL managed yang menyediakan connection string publik/SSL. Simpan connection string sebagai `DATABASE_URL`.

### 3. Import repository ke Netlify

Netlify → Add new project → Import an existing project → GitHub → pilih repository.

Build configuration:

- Build command: `npm run build`
- Node version: `20`
- Publish directory: biarkan Netlify menangani Next.js secara otomatis.

File `netlify.toml` sudah disediakan.

### 4. Environment variables

Tambahkan di Netlify → Project configuration → Environment variables:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
SESSION_SECRET=<random-secret-panjang>
```

Jangan commit `.env`, `.env.local`, atau password database ke GitHub.

### 5. Database migration

Build production menjalankan:

```text
prisma generate
prisma migrate deploy
next build
```

Migration pertama tersedia di:

```text
prisma/migrations/20260907100000_init/migration.sql
```

### 6. Seed data demo

Seed TIDAK dijalankan otomatis pada Netlify build agar data production tidak tertimpa/terduplikasi.

Jika ingin memasukkan data awal secara manual dari komputer yang terhubung ke database production:

```bash
DATABASE_URL="<production-database-url>" npx prisma db seed
```

atau:

```bash
DATABASE_URL="<production-database-url>" npm run seed
```

Setelah login pertama, segera ganti password demo.

## Local development

```bash
npm install
cp .env.example .env
# isi DATABASE_URL dan SESSION_SECRET
npx prisma migrate dev
npm run seed
npm run dev
```

Buka `http://localhost:3000`.

## Demo accounts

- `superadmin / ChangeMe123!`
- `admin1 / ChangeMe123!`
- `driver1 / ChangeMe123!`

Untuk production, ganti password demo dan gunakan `SESSION_SECRET` yang panjang dan acak.

## Catatan production

- Gunakan PostgreSQL managed dengan SSL.
- Jangan memasukkan credential database ke GitHub.
- Backup database secara berkala.
- Pastikan password akun demo diganti.
- Jika memakai custom domain, aktifkan HTTPS.
