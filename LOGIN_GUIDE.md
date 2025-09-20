# Panduan Login dan Role Selection

## Overview
Sistem login telah diperbarui dengan fitur pemilihan role sebelum login. Pengguna harus memilih role terlebih dahulu, kemudian melakukan login dengan kredensial yang sesuai.

## Flow Login
1. **Role Selection** (`/role-selection`) - Pengguna memilih role dari 6 pilihan yang tersedia
2. **Login** (`/login?role=<selected_role>`) - Pengguna login dengan email dan password
3. **Dashboard** (`/dashboard`) - Redirect ke dashboard sesuai role

## Role yang Tersedia
- **SUPER ADMIN** - Akses penuh ke semua fitur
- **OWNER** - Akses terbatas ke calendar, fleets, recap, dan order detail
- **FINANCE** - Akses ke fitur keuangan
- **ADMIN** - Akses administrasi
- **OPERATION** - Akses operasional
- **DRIVER** - Akses driver

## Kredensial Testing
Untuk testing, gunakan kredensial berikut:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@transgo.com | superadmin123 |
| Owner | owner@transgo.com | owner123 |
| Finance | finance@transgo.com | finance123 |
| Admin | admin@transgo.com | admin123 |
| Operation | operation@transgo.com | operation123 |
| Driver | driver@transgo.com | driver123 |

## File yang Ditambahkan/Dimodifikasi

### File Baru:
- `app/(auth)/role-selection/page.tsx` - Halaman pemilihan role
- `app/(auth)/login/page.tsx` - Halaman login dengan desain split screen
- `app/api/auth/login/route.ts` - API endpoint untuk login
- `components/ui/label.tsx` - Komponen Label
- `components/ui/card.tsx` - Komponen Card
- `app/page.tsx` - Halaman utama yang redirect ke role selection

### File yang Dimodifikasi:
- `lib/auth-options.ts` - Menambahkan support untuk role dalam credentials
- `middleware.ts` - Update routing untuk halaman auth baru
- `app/(auth)/(signin)/page.tsx` - Redirect ke role selection
- `components/forms/user-auth-form.tsx` - Menambahkan role ke signIn

## Cara Menjalankan
1. Pastikan semua dependencies terinstall: `npm install` atau `pnpm install`
2. Jalankan development server: `npm run dev` atau `pnpm dev`
3. Buka browser dan akses `http://localhost:3000`
4. Pilih role yang diinginkan
5. Login dengan kredensial yang sesuai

## Catatan
- Role yang dipilih disimpan di localStorage
- Middleware akan memvalidasi role dan mengarahkan ke halaman yang sesuai
- Jika tidak ada role yang dipilih, user akan diarahkan ke halaman role selection
