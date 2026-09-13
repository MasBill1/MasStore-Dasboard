-- ============================================================================
-- Hapus semua data contoh (dari seed.sql), tapi struktur tabel tetap ada.
-- Jalankan ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Setelah ini, semua tabel kosong dan siap kamu isi manual lewat dashboard.
-- ============================================================================

truncate table sales cascade;
truncate table account_fields cascade;
truncate table products cascade;
truncate table categories cascade;
truncate table whatsapp_templates cascade;

-- Store settings tetap ada (cuma 1 baris wajib untuk id=1), tapi kamu bisa
-- reset ke default kosong kalau mau:
update store_settings set
  store_name = 'My Store',
  logo_initial = 'ST',
  whatsapp_number = '',
  pricelist_footer = '',
  default_warranty_text = ''
where id = 1;
