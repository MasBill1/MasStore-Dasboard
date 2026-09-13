# Premium Account Store — Admin Dashboard

Dashboard internal untuk mengelola produk premium, pricelist, penjualan, akun
customer, dan garansi. Dibangun dengan React + Vite, tema **Elegant Purple SaaS**.

## Menjalankan project

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser. Build produksi dengan `npm run build`.

## Struktur project

```
src/
  main.jsx              Entry point (HashRouter + SalesProvider)
  App.jsx                Routing
  index.css              Global design system (warna, komponen, responsive)
  data/
    dummyData.js          Dummy data: categories, products, account templates, sales, wa templates
    SalesContext.jsx       Shared state untuk transaksi (in-memory)
  utils/
    helpers.js             Kalkulasi harga/profit, warranty, generator pesan WhatsApp
  components/
    Sidebar.jsx, Layout.jsx, ui.jsx (Badge/Modal/StatCard/EmptyState)
    AccountTemplateBuilder.jsx   Builder field akun dinamis per produk
  pages/
    Dashboard.jsx, Products.jsx, Categories.jsx, Pricelist.jsx,
    Sales.jsx, NewSale.jsx, TransactionDetail.jsx,
    WhatsappTemplates.jsx, Settings.jsx
```

## Apa yang sudah tersedia

- **Dashboard**: stat cards, chart revenue/profit (7D/30D/3M via Recharts), best
  sellers, recent sales.
- **Products**: search/filter (kategori, stock, status), add/edit modal dengan
  tab General / Pricing & Stock / Warranty / **Account Template** (builder field
  dinamis: label, type, required, visible to customer, reorder), enable/disable,
  delete.
- **Categories**: CRUD sederhana.
- **Pricelist**: tampilan customer-facing (tanpa buy price/profit/credential),
  tombol **Send via WhatsApp** (deep link `wa.me`, tanpa API) dan **Generate PNG**
  (kartu digital via `html-to-image`).
- **Sales**: riwayat transaksi + statistik (total transaksi, revenue, profit,
  AOV), filter lengkap (produk, kategori, payment, status garansi).
- **New Sale**: form customer + pilih produk → harga/profit otomatis, harga bisa
  di-override, field akun **mengikuti template produk** yang dipilih (bukan
  field global), validasi field wajib.
- **Transaction Detail**: snapshot transaksi lengkap (harga, garansi tidak
  berubah walau product diubah di kemudian hari), account access dengan
  show/hide password + copy, status garansi otomatis (Active/Expired), aksi
  Send Account via WhatsApp & Generate PNG.
- **WhatsApp Templates**: editor template (Pricelist, Account Delivery, Receipt,
  Warranty) dengan variable dinamis; variable yang tidak tersedia pada produk
  otomatis dihapus dari pesan.
- **Settings**: Store, Branding, Pricelist defaults, WhatsApp defaults.
- Fully responsive: sidebar jadi drawer di mobile, tabel beralih ke card list
  di layar sempit; input diperbesar font-nya di mobile biar tidak auto-zoom.
- **Dark mode**: toggle di sidebar, topbar mobile, dan halaman katalog customer,
  preferensi tersimpan otomatis.
- **Public Catalog** (`/#/catalog`): halaman terpisah tanpa sidebar admin, bisa
  dibuka langsung oleh customer. Produk dengan `familyName` sama otomatis
  digabung jadi satu card dengan pilihan durasi, tombol Order langsung
  memformat pesan WhatsApp ke nomor toko.
- **Login Admin**: semua halaman admin (Dashboard, Products, Sales, dst)
  dilindungi login (Supabase Auth). Akun admin dibuat manual lewat Supabase
  Dashboard — lihat `DEPLOY.md` bagian B. Katalog customer (`/#/catalog`)
  sengaja tetap publik tanpa login, supaya bisa langsung kamu share ke customer.

## Login & Keamanan

- Mode offline/demo (Supabase belum di-setup): tidak ada login sama sekali,
  semua halaman admin langsung bisa diakses (untuk kemudahan coba-coba lokal).
- Mode database (Supabase sudah di-setup): halaman admin butuh login, katalog
  customer tetap terbuka. RLS di database sudah diatur supaya publik cuma bisa
  **baca** produk/kategori (untuk katalog), tidak bisa mengubah apapun; data
  sales & whatsapp templates cuma bisa diakses admin yang login.

## Data & state

App ini punya **dua mode otomatis**, diatur oleh `src/data/AppDataContext.jsx`:

1. **Mode Offline/Demo** (default) — kalau file `.env` belum diisi kredensial Supabase,
   dashboard tetap jalan penuh pakai dummy data in-memory (`src/data/dummyData.js`).
   Perubahan (tambah produk, transaksi baru, dst) hanya tersimpan selama sesi
   browser berjalan, reset saat reload. Cocok untuk coba-coba/demo.
2. **Mode Database** — begitu `.env` diisi `VITE_SUPABASE_URL` dan
   `VITE_SUPABASE_ANON_KEY` (lihat `.env.example`), otomatis semua data
   dibaca/ditulis dari Supabase (Postgres asli). Data permanen tersimpan.

Lihat **`DEPLOY.md`** untuk panduan lengkap setup Supabase (gratis) + deploy ke
Vercel (gratis) langkah demi langkah.

## Struktur database (Supabase)

- `supabase/schema.sql` — semua tabel: categories, products, account_fields,
  sales, whatsapp_templates, store_settings + Row Level Security policy
- `supabase/seed.sql` — data contoh (sama seperti dummy data) supaya dashboard
  nggak kosong setelah connect
- `src/lib/supabaseClient.js` — koneksi client
- `src/lib/api.js` — semua fungsi CRUD (fetch/create/update/delete) per entity
- `src/data/AppDataContext.jsx` — context yang otomatis switch antara data
  Supabase dan dummy data, dipakai semua halaman lewat `useAppData()`

## Menyambungkan ke backend/database asli

Sudah tersambung! Tinggal ikuti `DEPLOY.md` bagian A untuk setup Supabase-nya.
Kalau nanti mau pindah ke database lain (MySQL, Firebase, dst), titik yang
perlu diganti cuma `src/lib/api.js` dan `src/lib/supabaseClient.js` — semua
halaman lain tetap sama karena mereka hanya bicara ke `useAppData()`.

## Catatan

- Warna utama: `#6D4AFF` (primary), `#4B2BBF` (dark), `#EEE9FF` (soft),
  background `#F8F7FC` — didefinisikan sebagai CSS variables di `src/index.css`,
  mudah diubah dari satu tempat (atau lewat halaman Settings → Branding untuk
  live customization di masa depan).
- Belum ada instalasi paket karena environment build ini tidak punya akses
  internet — jalankan `npm install` di komputer kamu sebelum `npm run dev`.
