-- ============================================================================
-- Migrasi: tambah field statistik "trust section" di landing page katalog.
-- Aman dijalankan berkali-kali.
-- ============================================================================
alter table store_settings add column if not exists trust_customer_count text default '100+';
alter table store_settings add column if not exists trust_avg_rating text default '4.9';
alter table store_settings add column if not exists trust_delivery_time text default '< 5 Mnt';
alter table store_settings add column if not exists trust_guarantee_percent text default '100%';
