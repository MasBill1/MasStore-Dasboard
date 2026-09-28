import { supabase } from './supabaseClient';

// ----------------------------------------------------------------------------
// Mappers: DB (snake_case) <-> App (camelCase)
// ----------------------------------------------------------------------------
export function slugify(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Produk Utama (tabel products): name, category, description, image, is_active, sort_order
function mapMasterFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || slugify(row.name),
    categoryId: row.category_id,
    description: row.description || '',
    imageUrl: row.image_url || null,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    variants: [],
  };
}

function mapMasterToDb(p) {
  return {
    name: p.name.trim(),
    family_name: p.name.trim(),
    slug: slugify(p.name),
    category_id: p.categoryId,
    description: p.description || '',
    image_url: p.imageUrl || null,
    is_active: p.isActive,
    updated_at: new Date().toISOString(),
  };
}

// Varian (tabel product_variants): harga, stok, garansi, field akun
function mapVariantFromDb(row, fields = []) {
  return {
    id: row.id,
    productId: row.product_id,
    groupName: row.group_name || '',
    label: row.label,
    duration: row.duration || '',
    buyPrice: Number(row.buy_price),
    sellPrice: Number(row.sell_price),
    discount: Number(row.discount),
    stockStatus: row.stock_status,
    warrantyEnabled: row.warranty_enabled,
    warrantyDuration: row.warranty_duration,
    warrantyUnit: row.warranty_unit,
    warrantyTerms: row.warranty_terms,
    warrantyInstructions: row.warranty_instructions,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    fields: fields
      .filter((f) => f.variant_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({
        id: f.id,
        label: f.label,
        key: f.key,
        type: f.type,
        required: f.required,
        visibleToCustomer: f.visible_to_customer,
        sortOrder: f.sort_order,
      })),
  };
}

function mapVariantToDb(v) {
  return {
    group_name: v.groupName?.trim() || null,
    label: v.label.trim(),
    duration: v.duration || '',
    buy_price: v.buyPrice,
    sell_price: v.sellPrice,
    discount: v.discount,
    stock_status: v.stockStatus,
    warranty_enabled: v.warrantyEnabled,
    warranty_duration: v.warrantyDuration,
    warranty_unit: v.warrantyUnit,
    warranty_terms: v.warrantyTerms,
    warranty_instructions: v.warrantyInstructions,
    is_active: v.isActive,
    updated_at: new Date().toISOString(),
  };
}

function mapSaleFromDb(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerWhatsapp: row.customer_whatsapp,
    productId: row.product_id,
    productName: row.product_name,
    productDescription: row.product_description,
    categoryName: row.category_name,
    duration: row.duration,
    quantity: row.quantity,
    buyPrice: Number(row.buy_price),
    sellPrice: Number(row.sell_price),
    discount: Number(row.discount),
    actualSellPrice: Number(row.actual_sell_price),
    total: Number(row.total),
    totalCost: Number(row.total_cost),
    profit: Number(row.profit),
    paymentMethod: row.payment_method,
    accountTemplateSnapshot: row.account_template_snapshot || [],
    accountData: row.account_data || {},
    warrantyDuration: row.warranty_duration,
    warrantyUnit: row.warranty_unit,
    warrantyTerms: row.warranty_terms,
    warrantyInstructions: row.warranty_instructions,
    purchaseDate: row.purchase_date,
    warrantyExpiry: row.warranty_expiry,
  };
}

function mapSaleToDb(s) {
  return {
    id: s.id,
    customer_name: s.customerName,
    customer_whatsapp: s.customerWhatsapp,
    product_id: s.productId,
    variant_id: s.variantId || null,
    product_name: s.productName,
    product_description: s.productDescription,
    category_name: s.categoryName,
    duration: s.duration,
    quantity: s.quantity,
    buy_price: s.buyPrice,
    sell_price: s.sellPrice,
    discount: s.discount,
    actual_sell_price: s.actualSellPrice,
    total: s.total,
    total_cost: s.totalCost,
    profit: s.profit,
    payment_method: s.paymentMethod,
    account_template_snapshot: s.accountTemplateSnapshot,
    account_data: s.accountData,
    warranty_duration: s.warrantyDuration,
    warranty_unit: s.warrantyUnit,
    warranty_terms: s.warrantyTerms,
    warranty_instructions: s.warrantyInstructions,
    purchase_date: s.purchaseDate,
    warranty_expiry: s.warrantyExpiry,
  };
}

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------
export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data.map((c) => ({ id: c.id, name: c.name }));
}

export async function createCategory(name) {
  const { data, error } = await supabase.from('categories').insert({ name }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name };
}

export async function updateCategory(id, name) {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Katalog: Produk Utama -> Varian (+ account fields per varian)
// ----------------------------------------------------------------------------
export async function fetchCatalog() {
  const [{ data: products, error: pErr }, { data: variants, error: vErr }, { data: fields, error: fErr }] =
    await Promise.all([
      supabase.from('products').select('*').order('sort_order').order('created_at'),
      supabase.from('product_variants').select('*').order('sort_order').order('created_at'),
      supabase.from('account_fields').select('*').order('sort_order'),
    ]);
  if (pErr) throw pErr;
  if (vErr) throw vErr;
  if (fErr) throw fErr;
  const masters = products.map(mapMasterFromDb);
  const byId = new Map(masters.map((m) => [m.id, m]));
  variants.forEach((v) => byId.get(v.product_id)?.variants.push(mapVariantFromDb(v, fields)));
  return masters;
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(mapMasterToDb(product)).select().single();
  if (error) throw error;
  return data.id;
}

export async function updateProduct(id, product) {
  const { error } = await supabase.from('products').update(mapMasterToDb(product)).eq('id', id);
  if (error) throw error;
}

// Menghapus Produk Utama ikut menghapus semua variannya (cascade).
export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function setProductActive(id, isActive) {
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

function fieldRows(variantId, fields = []) {
  return fields.map((f, i) => ({
    variant_id: variantId,
    label: f.label,
    key: f.key,
    type: f.type,
    required: f.required,
    visible_to_customer: f.visibleToCustomer,
    sort_order: i + 1,
  }));
}

export async function createVariant(productId, variant) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ ...mapVariantToDb(variant), product_id: productId })
    .select()
    .single();
  if (error) throw error;
  if (variant.fields?.length) {
    const { error: fErr } = await supabase.from('account_fields').insert(fieldRows(data.id, variant.fields));
    if (fErr) throw fErr;
  }
  return data.id;
}

export async function updateVariant(id, variant) {
  const { error } = await supabase.from('product_variants').update(mapVariantToDb(variant)).eq('id', id);
  if (error) throw error;
  // Ganti seluruh field akun varian ini.
  const { error: dErr } = await supabase.from('account_fields').delete().eq('variant_id', id);
  if (dErr) throw dErr;
  if (variant.fields?.length) {
    const { error: fErr } = await supabase.from('account_fields').insert(fieldRows(id, variant.fields));
    if (fErr) throw fErr;
  }
}

export async function deleteVariant(id) {
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw error;
}

export async function setVariantActive(id, isActive) {
  const { error } = await supabase.from('product_variants').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

// Uploads a product image to the 'product-images' storage bucket and returns
// its public URL. Only works once Supabase is configured and the person is
// logged in (storage write policy requires an authenticated session).
export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

// ----------------------------------------------------------------------------
// Sales
// ----------------------------------------------------------------------------
export async function fetchSales() {
  const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapSaleFromDb);
}

export async function createSale(sale) {
  const { error } = await supabase.from('sales').insert(mapSaleToDb(sale));
  if (error) throw error;
}

export async function deleteSale(id) {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// WhatsApp Templates
// ----------------------------------------------------------------------------
export async function fetchWhatsappTemplates() {
  const { data, error } = await supabase.from('whatsapp_templates').select('*').order('type');
  if (error) throw error;
  return data.map((t) => ({ id: t.id, type: t.type, name: t.name, content: t.content }));
}

export async function updateWhatsappTemplate(id, content) {
  const { error } = await supabase.from('whatsapp_templates').update({ content }).eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Store Settings (single row, id = 1)
// ----------------------------------------------------------------------------
export async function fetchStoreSettings() {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return {
    storeName: data.store_name,
    logoInitial: data.logo_initial,
    whatsappNumber: data.whatsapp_number,
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    pricelistFooter: data.pricelist_footer,
    defaultWarrantyText: data.default_warranty_text,
    trustCustomerCount: data.trust_customer_count || '100+',
    trustAvgRating: data.trust_avg_rating || '4.9',
    trustDeliveryTime: data.trust_delivery_time || '< 5 Mnt',
    trustGuaranteePercent: data.trust_guarantee_percent || '100%',
  };
}

export async function updateStoreSettings(settings) {
  const { error } = await supabase.from('store_settings').update({
    store_name: settings.storeName,
    logo_initial: settings.logoInitial,
    whatsapp_number: settings.whatsappNumber,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    pricelist_footer: settings.pricelistFooter,
    default_warranty_text: settings.defaultWarrantyText,
    trust_customer_count: settings.trustCustomerCount,
    trust_avg_rating: settings.trustAvgRating,
    trust_delivery_time: settings.trustDeliveryTime,
    trust_guarantee_percent: settings.trustGuaranteePercent,
  }).eq('id', 1);
  if (error) throw error;
}
