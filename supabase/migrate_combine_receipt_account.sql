-- ============================================================================
-- Update isi default template "Account Delivery" supaya gabung dengan struk
-- pembelian (ID transaksi, total, tanggal) dalam satu pesan.
-- Aman dijalankan berkali-kali. Kalau kamu sudah pernah edit manual template
-- ini di halaman WhatsApp Templates, migrasi ini TIDAK akan menimpa
-- perubahan kamu -- cukup jalankan kalau mau reset ke versi terbaru.
-- ============================================================================
update whatsapp_templates set content = E'Halo {customer_name},\n\nTerima kasih sudah order di {store_name}! Berikut struk & detail akun kamu.\n\nSTRUK PEMBELIAN\nID Transaksi: {transaction_id}\nProduk: {product_name}\nDurasi: {duration}\nTotal: {total}\nTanggal: {purchase_date}\n\nGARANSI\nDurasi: {warranty_duration}\nBerlaku sampai: {warranty_expiry}\n\nKETENTUAN GARANSI\n{warranty_terms}\n\nTerima kasih sudah order di {store_name}.'
where id = 'wa-delivery';
