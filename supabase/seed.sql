-- ============================================================================
-- Optional seed data — isi awal supaya dashboard tidak kosong setelah connect.
-- Jalankan SETELAH schema.sql, di SQL Editor yang sama.
-- ============================================================================

insert into categories (id, name) values
  ('cat-streaming', 'Streaming'),
  ('cat-design', 'Design Tools'),
  ('cat-music', 'Music'),
  ('cat-productivity', 'Productivity'),
  ('cat-vpn', 'VPN & Security')
on conflict (id) do nothing;

insert into products (id, name, family_name, category_id, description, duration, buy_price, sell_price, discount, stock_status, warranty_enabled, warranty_duration, warranty_unit, warranty_terms, warranty_instructions, is_active, sort_order) values
  ('prod-netflix-1m', 'Netflix Premium', 'Netflix Premium', 'cat-streaming', 'Akun Netflix Premium sharing, UHD 4K, 4 layar bersamaan.', '1 Bulan', 9000, 18000, 3000, 'in_stock', true, 7, 'days', 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.', E'1. Screenshot kendala.\n2. Kirim bukti melalui WhatsApp.', true, 1),
  ('prod-netflix-3m', 'Netflix Premium 3 Bulan', 'Netflix Premium', 'cat-streaming', 'Akun Netflix Premium sharing untuk 3 bulan, hemat lebih banyak.', '3 Bulan', 24000, 48000, 5000, 'in_stock', true, 7, 'days', 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.', E'1. Screenshot kendala.\n2. Kirim bukti melalui WhatsApp.', true, 2),
  ('prod-canva-1y', 'Canva Pro', 'Canva Pro', 'cat-design', 'Akun Canva Pro 1 tahun, akses semua fitur premium.', '1 Tahun', 15000, 35000, 0, 'in_stock', true, 14, 'days', 'Garansi replace jika akun ter-logout otomatis.', E'1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.', true, 3),
  ('prod-spotify-1m', 'Spotify Premium', 'Spotify Premium', 'cat-music', 'Akun Spotify Premium individu, bebas iklan.', '1 Bulan', 8000, 15000, 1000, 'low_stock', true, 7, 'days', 'Garansi replace bila akun bermasalah dari sisi kami.', E'1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.', true, 4),
  ('prod-office-1y', 'Microsoft 365 Personal', 'Microsoft 365 Personal', 'cat-productivity', 'Akun Microsoft 365 lengkap dengan Word, Excel, PowerPoint, 1TB OneDrive.', '1 Tahun', 45000, 89000, 10000, 'in_stock', true, 30, 'days', 'Garansi penuh selama masa aktif langganan.', E'1. Screenshot kendala aktivasi.\n2. Kirim ke WhatsApp admin.', true, 5),
  ('prod-vpn-1m', 'NordVPN Premium', 'NordVPN Premium', 'cat-vpn', 'Akses VPN premium kecepatan tinggi, unlimited device.', '1 Bulan', 12000, 25000, 0, 'out_of_stock', false, 0, 'days', '', '', false, 6)
on conflict (id) do nothing;

insert into account_fields (product_id, label, key, type, required, visible_to_customer, sort_order) values
  ('prod-netflix-1m', 'Email', 'email', 'text', true, true, 1),
  ('prod-netflix-1m', 'Password', 'password', 'password', true, true, 2),
  ('prod-netflix-1m', 'Profile', 'profile', 'text', false, true, 3),
  ('prod-netflix-1m', 'PIN', 'pin', 'text', false, true, 4),
  ('prod-netflix-3m', 'Email', 'email', 'text', true, true, 1),
  ('prod-netflix-3m', 'Password', 'password', 'password', true, true, 2),
  ('prod-netflix-3m', 'Profile', 'profile', 'text', false, true, 3),
  ('prod-netflix-3m', 'PIN', 'pin', 'text', false, true, 4),
  ('prod-canva-1y', 'Email', 'email', 'text', true, true, 1),
  ('prod-canva-1y', 'Access Link', 'access_link', 'url', true, true, 2),
  ('prod-spotify-1m', 'Email', 'email', 'text', true, true, 1),
  ('prod-spotify-1m', 'Password', 'password', 'password', true, true, 2),
  ('prod-office-1y', 'Username', 'username', 'text', true, true, 1),
  ('prod-office-1y', 'Password', 'password', 'password', true, true, 2),
  ('prod-office-1y', 'License Key', 'license_key', 'text', false, true, 3),
  ('prod-office-1y', 'Activation Link', 'activation_link', 'url', false, false, 4),
  ('prod-vpn-1m', 'Username', 'username', 'text', true, true, 1),
  ('prod-vpn-1m', 'Password', 'password', 'password', true, true, 2),
  ('prod-vpn-1m', 'Server', 'server', 'text', false, true, 3);

insert into whatsapp_templates (id, type, name, content) values
  ('wa-pricelist', 'Pricelist', 'Pricelist Default', E'{product_name}\n\nDurasi: {duration}\nHarga: {price}\nStock: {stock_status}\nGaransi: {warranty_duration}\n\nJika berminat silakan order.\n\n{store_name}'),
  ('wa-delivery', 'Account Delivery', 'Account Delivery Default', E'Halo {customer_name},\n\nTerima kasih sudah order di {store_name}! Berikut struk & detail akun kamu.\n\nSTRUK PEMBELIAN\nID Transaksi: {transaction_id}\nProduk: {product_name}\nDurasi: {duration}\nTotal: {total}\nTanggal: {purchase_date}\n\nGARANSI\nDurasi: {warranty_duration}\nBerlaku sampai: {warranty_expiry}\n\nKETENTUAN GARANSI\n{warranty_terms}\n\nTerima kasih sudah order di {store_name}.'),
  ('wa-receipt', 'Receipt', 'Struk Pembelian', E'Terima kasih {customer_name}!\n\nID Transaksi: {transaction_id}\nProduk: {product_name}\nQty: {quantity}\nTotal: {total}\nTanggal: {purchase_date}\n\n{store_name}'),
  ('wa-warranty', 'Warranty', 'Info Garansi', E'Halo {customer_name},\n\nInfo garansi untuk pembelian {product_name}:\n\nBerlaku sampai: {warranty_expiry}\n\nKetentuan:\n{warranty_terms}\n\n{store_name}')
on conflict (id) do nothing;

update store_settings set
  store_name = 'NexPremium Store',
  logo_initial = 'NP',
  whatsapp_number = '628123456789',
  pricelist_footer = 'Harga sewaktu-waktu dapat berubah. Order sebelum kehabisan stock ya!',
  default_warranty_text = 'Garansi berlaku selama masa aktif, tidak termasuk kesalahan pengguna.'
where id = 1;
