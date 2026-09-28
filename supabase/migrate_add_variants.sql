-- ============================================================================
-- MasStore - Migration: Produk Utama -> Varian  (untuk database KOSONG)
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor.
-- Bersifat additive: tidak menghapus tabel/kolom lama, aman diulang setelah
-- rollback. Berhenti otomatis kalau tabel products masih berisi data
-- (pakai draf migrasi lengkap untuk kasus itu).
-- ============================================================================
begin;

do $$
begin
  if exists (select 1 from products) then
    raise exception 'Tabel products masih berisi data. Hapus dulu, atau pakai draf migrasi lengkap.';
  end if;
end $$;

create table product_variants (
  id text primary key default ('var-' || replace(gen_random_uuid()::text, '-', '')),
  product_id text not null references products(id) on delete cascade,
  group_name text,
  label text not null,
  duration text default '',
  buy_price numeric default 0,
  sell_price numeric default 0,
  discount numeric default 0,
  stock_status text default 'in_stock' check (stock_status in ('in_stock','low_stock','out_of_stock')),
  warranty_enabled boolean default true,
  warranty_duration integer default 7,
  warranty_unit text default 'days' check (warranty_unit in ('days','weeks','months','years')),
  warranty_terms text default '',
  warranty_instructions text default '',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index product_variants_product_id_idx on product_variants(product_id);

alter table product_variants enable row level security;
create policy "product_variants_select_public" on product_variants for select using (true);
create policy "product_variants_insert_auth" on product_variants for insert with check (auth.role() = 'authenticated');
create policy "product_variants_update_auth" on product_variants for update using (auth.role() = 'authenticated');
create policy "product_variants_delete_auth" on product_variants for delete using (auth.role() = 'authenticated');

alter table account_fields add column variant_id text references product_variants(id) on delete cascade;
alter table sales          add column variant_id text references product_variants(id) on delete set null;
alter table products       add column slug text;
create unique index products_slug_key on products(slug);

commit;

-- ROLLBACK (manual, bila perlu):
-- begin;
--   drop index products_slug_key;
--   alter table products drop column slug;
--   alter table sales drop column variant_id;
--   alter table account_fields drop column variant_id;
--   drop table product_variants;
-- commit;
