import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (lihat .env.example / Vercel Environment Variables). Dashboard akan jalan dalam mode demo (dummy data) sampai ini diisi.'
  );
}

// createClient() melempar error kalau URL-nya kosong/tidak valid — dan karena
// ini dijalankan saat file di-load (sebelum React sempat render apapun), efeknya
// bikin SELURUH aplikasi blank putih tanpa pesan error yang kelihatan di layar.
// Makanya kalau env var belum diisi, kita pakai URL placeholder yang formatnya
// valid (supaya tidak throw) tapi tidak pernah benar-benar dipakai untuk fetch
// data asli — semua pemanggilan Supabase di app ini sudah dibungkus pengecekan
// `isSupabaseConfigured` terlebih dahulu.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
