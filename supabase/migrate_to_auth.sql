-- ============================================================================
-- Migrasi RLS: dari "semua orang boleh baca-tulis" ke "publik cuma baca
-- katalog, admin login baru boleh tulis / lihat data sensitif".
--
-- Jalankan ini SEKALI di Supabase -> SQL Editor kalau tabel kamu sudah dibuat
-- pakai schema.sql versi lama (yang policy-nya "for all using (true)").
-- Aman dijalankan berkali-kali (drop policy pakai "if exists").
-- ============================================================================

drop policy if exists "public read/write categories" on categories;
drop policy if exists "public read/write products" on products;
drop policy if exists "public read/write account_fields" on account_fields;
drop policy if exists "public read/write sales" on sales;
drop policy if exists "public read/write whatsapp_templates" on whatsapp_templates;
drop policy if exists "public read/write store_settings" on store_settings;

create policy "categories_select_public" on categories for select using (true);
create policy "categories_insert_auth" on categories for insert with check (auth.role() = 'authenticated');
create policy "categories_update_auth" on categories for update using (auth.role() = 'authenticated');
create policy "categories_delete_auth" on categories for delete using (auth.role() = 'authenticated');

create policy "products_select_public" on products for select using (true);
create policy "products_insert_auth" on products for insert with check (auth.role() = 'authenticated');
create policy "products_update_auth" on products for update using (auth.role() = 'authenticated');
create policy "products_delete_auth" on products for delete using (auth.role() = 'authenticated');

create policy "account_fields_select_public" on account_fields for select using (true);
create policy "account_fields_insert_auth" on account_fields for insert with check (auth.role() = 'authenticated');
create policy "account_fields_update_auth" on account_fields for update using (auth.role() = 'authenticated');
create policy "account_fields_delete_auth" on account_fields for delete using (auth.role() = 'authenticated');

create policy "store_settings_select_public" on store_settings for select using (true);
create policy "store_settings_update_auth" on store_settings for update using (auth.role() = 'authenticated');

create policy "sales_all_auth" on sales for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "whatsapp_templates_all_auth" on whatsapp_templates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
