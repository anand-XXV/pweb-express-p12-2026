# pweb-express-p12-2026

## Status awal repository

Repository ini sudah disiapkan untuk praktikum MLBB Shop. Dataset resmi telah dikonversi ke format JSON, collection Postman tersedia, dan semua dependency awal sudah terpasang.

## Persiapan

1. Isi `DATABASE_URL` dan `DIRECT_URL` pada `.env` dengan connection string Neon.
2. Lengkapi `prisma/schema.prisma`.
3. Jalankan:

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

4. Jalankan server saat pengembangan selesai:

```powershell
npm run dev
```

Jangan commit file `.env`.

## Fitur yang sudah tersedia

- Prisma schema dan seed database.
- Logger, `HttpError`, error handler, dan middleware 404.
- Format response sukses.
- GET `/health`.
- Pembelian hero: `POST /api/players/:id/heroes`.
- Statistik: `GET /api/statistics`.

## Daftar Anggota Kelompok A12
| Nama | NRP |
|:--|:-:|
| I Made Gyanendra Anand Wisnawa | 5027251072 |
| Ronnin Raditya Putra Purbono | 5027251119|
| Mahrinza Redouane Zakariyah | 5027251074 |
