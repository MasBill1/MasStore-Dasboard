# Panduan Deploy — Gratis Semua (Supabase + Vercel)

Dua langkah besar: **(A)** setup database di Supabase, **(B)** deploy frontend ke Vercel.
Keduanya ada free tier yang cukup untuk dashboard internal skala kecil-menengah.

---

## A. Setup Database (Supabase)

1. Buka **[supabase.com](https://supabase.com)** → Sign up (bisa pakai akun GitHub) → **New Project**
   - Isi nama project bebas, misal `premium-dashboard`
   - Pilih region terdekat (misal Singapore kalau kamu di Indonesia)
   - Buat password database (simpan baik-baik, walau nggak dipakai langsung di kode)
   - Tunggu ~2 menit sampai project selesai dibuat

2. Buat tabel-tabelnya:
   - Di sidebar kiri, klik **SQL Editor** → **New query**
   - Buka file `supabase/schema.sql` dari project ini, copy semua isinya, paste, klik **Run**
   - Ulangi langkah yang sama dengan file `supabase/seed.sql` (ini ngisi data contoh biar dashboard nggak kosong)

3. Ambil kredensial API:
   - Sidebar kiri → **Project Settings** (ikon gear) → **API**
   - Copy **Project URL** dan **anon public key**

4. Di folder project kamu (di komputer), buat file baru bernama **`.env`** (bukan `.env.example`), isi:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=isi-anon-key-kamu-di-sini
   ```
5. Jalankan lagi `npm run dev` — kalau berhasil connect, data yang muncul adalah data dari Supabase (bukan dummy lagi). Coba tambah kategori/produk baru, refresh halaman — kalau datanya tetap ada setelah refresh, berarti sudah beneran connect ke database.

> **Catatan keamanan:** schema.sql saat ini membuka akses penuh baca/tulis lewat `anon key` (supaya gampang buat prototipe). Ini oke untuk dashboard internal yang linknya nggak disebar, tapi kalau nanti serius dipakai dan halaman admin bisa diakses publik, tambahkan Supabase Auth (login email/password) dan ganti policy di `schema.sql` supaya hanya user yang login yang bisa insert/update/delete.

---

## B. Setup Login Admin (Supabase Auth)

Dashboard admin (Products, Sales, Settings, dst) sekarang butuh login. Katalog
customer di `/#/catalog` **tetap publik, tidak butuh login**.

1. Di Supabase Dashboard project kamu → sidebar **Authentication** → tab **Users**
2. Klik **Add user** → **Create new user**
3. Isi email & password buat akun admin kamu sendiri (misal `admin@tokokamu.com`)
   — centang **Auto Confirm User** supaya langsung aktif tanpa perlu verifikasi email
4. Klik **Create user**

Itu saja. **Jangan buka pendaftaran publik** — akun admin cuma dibuat manual
lewat Supabase Dashboard, bukan lewat form di aplikasi (memang sengaja tidak
ada halaman "Daftar", biar cuma kamu yang bisa bikin akun admin baru).

Kalau kamu **sudah pernah** menjalankan `schema.sql` versi lama (sebelum ada
sistem login), jalankan juga `supabase/migrate_to_auth.sql` di SQL Editor
supaya security rule-nya ter-update (publik cuma bisa baca katalog, tidak bisa
lagi tulis/hapus data).

Setelah itu, buka `npm run dev` lagi → buka `http://localhost:5173` → kamu
akan diarahkan ke halaman **Login** dulu sebelum masuk dashboard. Login pakai
email & password yang barusan kamu buat.

---

## C. Deploy Frontend (Vercel)

1. **Push project ke GitHub**
   - Buat repo baru di [github.com/new](https://github.com/new) (bisa private)
   - Di folder project, jalankan:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/USERNAME/NAMA-REPO.git
     git push -u origin main
     ```
   - `.env` tidak akan ikut ter-push (sudah ada di `.gitignore`) — ini memang benar, karena env var diisi langsung di Vercel, bukan di dalam kode.

2. **Deploy ke Vercel**
   - Buka **[vercel.com](https://vercel.com)** → Sign up pakai akun GitHub → **Add New Project**
   - Pilih repo yang baru kamu push
   - Vercel otomatis mendeteksi ini project Vite — biarkan default build settings (`npm run build`, output folder `dist`)
   - Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
     - `VITE_SUPABASE_URL` = (isi dari Supabase)
     - `VITE_SUPABASE_ANON_KEY` = (isi dari Supabase)
   - Klik **Deploy**, tunggu ~1 menit

3. Selesai — kamu dapat link publik seperti `https://nama-project.vercel.app`
   - **Dashboard admin** (perlu login): `https://nama-project.vercel.app/#/`
   - **Katalog customer** (publik, tanpa login): `https://nama-project.vercel.app/#/catalog`

   Link katalog inilah yang kamu **share ke customer** — mereka nggak akan bisa
   nyasar ke halaman admin walau tau domainnya, karena begitu buka `/#/` mereka
   akan ditendang ke halaman Login. Kamu simpan link admin (`/#/`) buat diri
   sendiri, dan sebar link `/#/catalog` ke customer/grup WA/bio Instagram, dst.

   Kalau nanti sudah punya domain sendiri, kamu juga bisa bikin domain/subdomain
   terpisah yang mengarah ke path yang sama, misal `catalog.tokokamu.com` →
   redirect ke `tokokamu.com/#/catalog`, biar link-nya kelihatan lebih rapi.

4. **Update selanjutnya**: tiap kamu `git push` ke branch `main`, Vercel otomatis build & deploy ulang. Nggak perlu re-upload manual.

---

## Kalau belum mau pakai GitHub dulu

Bisa juga deploy langsung dari komputer pakai Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```
Ikuti instruksi di terminal (pilih folder project, biarkan default settings). Untuk env variable, jalankan:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```
lalu `vercel --prod` lagi supaya env variable-nya kepakai.

---

## Ringkasan biaya

| Layanan | Free tier | Cukup untuk |
|---|---|---|
| Supabase | 500MB database, 5GB bandwidth/bulan | Ribuan transaksi, jauh lebih dari cukup buat toko kecil-menengah |
| Vercel | 100GB bandwidth/bulan, unlimited deploy | Traffic dashboard internal + katalog customer skala kecil-menengah |

Kalau nanti bisnis makin besar, tinggal upgrade plan berbayar — tidak perlu pindah platform.
