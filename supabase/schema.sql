-- ============================================================================
-- Premium Account Dashboard — Supabase schema
-- Jalankan file ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- Enable UUID generator (biasanya sudah aktif di Supabase secara default)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id text primary key default ('cat-' || replace(gen_random_uuid()::text, '-', '')),
  name text not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Products
-- ----------------------------------------------------------------------------
create table if not exists products (
  id text primary key default ('prod-' || replace(gen_random_uuid()::text, '-', '')),
  name text not null,
  family_name text not null,
  category_id text references categories(id) on delete set null,
  description text default '',
  duration text default '',
  buy_price numeric default 0,
  sell_price numeric default 0,
  discount numeric default 0,
  stock_status text default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  warranty_enabled boolean default true,
  warranty_duration integer default 7,
  warranty_unit text default 'days' check (warranty_unit in ('days', 'weeks', 'months', 'years')),
  warranty_terms text default '',
  warranty_instructions text default '',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Account Template Fields (one product -> many fields)
-- ----------------------------------------------------------------------------
create table if not exists account_fields (
  id text primary key default ('field-' || replace(gen_random_uuid()::text, '-', '')),
  product_id text references products(id) on delete cascade,
  label text not null,
  key text not null,
  type text default 'text' check (type in ('text', 'password', 'url', 'number', 'textarea')),
  required boolean default true,
  visible_to_customer boolean default true,
  sort_order integer default 0
);

-- ----------------------------------------------------------------------------
-- Sales / Transactions — stores an immutable snapshot at time of purchase
-- ----------------------------------------------------------------------------
create table if not exists sales (
  id text primary key,
  customer_name text not null,
  customer_whatsapp text not null,
  product_id text references products(id) on delete set null,
  product_name text,
  product_description text,
  category_name text,
  duration text,
  quantity integer default 1,
  buy_price numeric default 0,
  sell_price numeric default 0,
  discount numeric default 0,
  actual_sell_price numeric default 0,
  total numeric default 0,
  total_cost numeric default 0,
  profit numeric default 0,
  payment_method text default 'Transfer',
  account_template_snapshot jsonb default '[]',
  account_data jsonb default '{}',
  warranty_duration integer default 0,
  warranty_unit text default 'days',
  warranty_terms text default '',
  warranty_instructions text default '',
  purchase_date date default current_date,
  warranty_expiry date,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- WhatsApp Templates
-- ----------------------------------------------------------------------------
create table if not exists whatsapp_templates (
  id text primary key default ('wa-' || replace(gen_random_uuid()::text, '-', '')),
  type text not null,
  name text not null,
  content text not null
);

-- ----------------------------------------------------------------------------
-- Store Settings (single row)
-- ----------------------------------------------------------------------------
create table if not exists store_settings (
  id integer primary key default 1,
  store_name text default 'My Store',
  logo_initial text default 'ST',
  whatsapp_number text default '',
  primary_color text default '#6D4AFF',
  secondary_color text default '#4B2BBF',
  pricelist_footer text default '',
  default_warranty_text text default '',
  constraint single_row check (id = 1)
);

insert into store_settings (id) values (1) on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
--
-- Prinsipnya:
-- - categories, products, account_fields, store_settings: BOLEH dibaca siapa
--   saja (dipakai oleh halaman Katalog Customer yang publik), tapi HANYA
--   admin yang sudah login (authenticated) yang boleh insert/update/delete.
-- - sales, whatsapp_templates: HANYA admin yang login yang boleh
--   baca/tulis sama sekali (data transaksi & template internal, tidak untuk
--   publik).
--
-- Supaya ini berfungsi, aktifkan Supabase Auth dan buat akun admin manual di
-- Supabase Dashboard -> Authentication -> Users -> Add user (jangan buka
-- pendaftaran publik).
-- ============================================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table account_fields enable row level security;
alter table sales enable row level security;
alter table whatsapp_templates enable row level security;
alter table store_settings enable row level security;

-- ---- categories: baca publik, tulis admin saja ----
create policy "categories_select_public" on categories for select using (true);
create policy "categories_insert_auth" on categories for insert with check (auth.role() = 'authenticated');
create policy "categories_update_auth" on categories for update using (auth.role() = 'authenticated');
create policy "categories_delete_auth" on categories for delete using (auth.role() = 'authenticated');

-- ---- products: baca publik, tulis admin saja ----
create policy "products_select_public" on products for select using (true);
create policy "products_insert_auth" on products for insert with check (auth.role() = 'authenticated');
create policy "products_update_auth" on products for update using (auth.role() = 'authenticated');
create policy "products_delete_auth" on products for delete using (auth.role() = 'authenticated');

-- ---- account_fields: baca publik (perlu buat tampilkan field di katalog kalau nanti dipakai), tulis admin saja ----
create policy "account_fields_select_public" on account_fields for select using (true);
create policy "account_fields_insert_auth" on account_fields for insert with check (auth.role() = 'authenticated');
create policy "account_fields_update_auth" on account_fields for update using (auth.role() = 'authenticated');
create policy "account_fields_delete_auth" on account_fields for delete using (auth.role() = 'authenticated');

-- ---- store_settings: baca publik (perlu nama toko/nomor WA di katalog), tulis admin saja ----
create policy "store_settings_select_public" on store_settings for select using (true);
create policy "store_settings_update_auth" on store_settings for update using (auth.role() = 'authenticated');

-- ---- sales: HANYA admin (data transaksi customer, tidak untuk publik) ----
create policy "sales_all_auth" on sales for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- whatsapp_templates: HANYA admin ----
create policy "whatsapp_templates_all_auth" on whatsapp_templates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
