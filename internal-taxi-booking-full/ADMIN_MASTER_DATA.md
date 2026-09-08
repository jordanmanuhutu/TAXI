# TaxiOps — Super Admin Master Data

Fitur yang ditambahkan:
- Edit/Add Hotel (nama, alamat, active/inactive)
- Edit/Add Vehicle (nama mobil, type, nomor polisi, hotel, active/inactive)
- Edit/Add Driver (nama, nomor HP, hotel, active/inactive)
- Create/Edit User (username, nama, password/reset password, role, hotel, driver untuk role DRIVER, active/inactive)
- Perlindungan agar Super Admin terakhir tidak dapat dinonaktifkan/diturunkan role-nya dan akun sendiri tidak dapat dinonaktifkan.
- Audit log 20 aktivitas terakhir di halaman Administration.
- Semua perubahan master data dibatasi di server hanya untuk SUPER_ADMIN.
- User INACTIVE tidak dapat login.

Migration:
`prisma/migrations/20260908120000_admin_master_data/migration.sql`

Deploy:
1. Upload/commit seluruh isi project ke GitHub.
2. Netlify akan menjalankan `prisma migrate deploy` melalui `npm run build`.
3. Jangan menjalankan seed pada setiap deploy karena seed demo dapat mengubah password demo.
