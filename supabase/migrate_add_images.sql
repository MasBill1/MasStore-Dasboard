-- ============================================================================
-- Migrasi: tambah dukungan gambar produk (image_url + storage bucket).
-- Jalankan ini kalau tabel kamu sudah dibuat sebelum fitur ini ditambahkan.
-- Aman dijalankan berkali-kali.
-- ============================================================================

alter table products add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_select_public" on storage.objects;
drop policy if exists "product_images_insert_auth" on storage.objects;
drop policy if exists "product_images_update_auth" on storage.objects;
drop policy if exists "product_images_delete_auth" on storage.objects;

create policy "product_images_select_public" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_insert_auth" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product_images_update_auth" on storage.objects for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product_images_delete_auth" on storage.objects for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');
