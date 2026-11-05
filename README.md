# pweb-express-p12-2026

## Daftar Anggota Kelompok A12
| Nama | NRP |
|:--|:-:|
| I Made Gyanendra Anand Wisnawa | 5027251072 |
| Ronnin Raditya Putra Purbono | 5027251119|
| Mahrinza Redouane Zakariyah | 5027251074 |

## Setup

1. Isi `DATABASE_URL` dan `DIRECT_URL` pada `.env` dengan connection string Neon.
2. Lengkapi `prisma/schema.prisma`.
3. Jalankan:

```
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

4. Jalankan server saat pengembangan selesai:

```
npm run dev
```

Untuk melakukan testing lagi setelah kode di modifikasi, cukup jalankan

```
npm run seed
npm run dev
```

Catatan: Jika npm tidak bisa digunakan, dapat gunakan npm.cmd (hanya berlaku jika menjalankan npm di dalam powershell)