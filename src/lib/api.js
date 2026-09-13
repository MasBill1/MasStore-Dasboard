import { supabase } from './supabaseClient';

// ----------------------------------------------------------------------------
// Mappers: DB (snake_case) <-> App (camelCase)
// ----------------------------------------------------------------------------
function mapProductFromDb(row, fields = []) {
  return {
    id: row.id,
    name: row.name,
    familyName: row.family_name,
    categoryId: row.category_id,
    description: row.description,
    duration: row.duration,
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fields: fields
      .filter((f) => f.product_id === row.id)
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

function mapProductToDb(p) {
  return {
    name: p.name,
    family_name: p.familyName || p.name,
    category_id: p.categoryId,
    description: p.description,
    duration: p.duration,
    buy_price: p.buyPrice,
    sell_price: p.sellPrice,
    discount: p.discount,
    stock_status: p.stockStatus,
    warranty_enabled: p.warrantyEnabled,
    warranty_duration: p.warrantyDuration,
    warranty_unit: p.warrantyUnit,
    warranty_terms: p.warrantyTerms,
    warranty_instructions: p.warrantyInstructions,
    is_active: p.isActive,
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
// Products (+ account fields)
// ----------------------------------------------------------------------------
export async function fetchProducts() {
  const [{ data: products, error: pErr }, { data: fields, error: fErr }] = await Promise.all([
    supabase.from('products').select('*').order('sort_order'),
    supabase.from('account_fields').select('*').order('sort_order'),
  ]);
  if (pErr) throw pErr;
  if (fErr) throw fErr;
  return products.map((p) => mapProductFromDb(p, fields));
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(mapProductToDb(product)).select().single();
  if (error) throw error;
  if (product.fields?.length) {
    const rows = product.fields.map((f, i) => ({
      product_id: data.id,
      label: f.label,
      key: f.key,
      type: f.type,
      required: f.required,
      visible_to_customer: f.visibleToCustomer,
      sort_order: i + 1,
    }));
    const { error: fErr } = await supabase.from('account_fields').insert(rows);
    if (fErr) throw fErr;
  }
  return data.id;
}

export async function updateProduct(id, product) {
  const { error } = await supabase.from('products').update(mapProductToDb(product)).eq('id', id);
  if (error) throw error;
  // Simplest safe approach: replace all fields for this product.
  await supabase.from('account_fields').delete().eq('product_id', id);
  if (product.fields?.length) {
    const rows = product.fields.map((f, i) => ({
      product_id: id,
      label: f.label,
      key: f.key,
      type: f.type,
      required: f.required,
      visible_to_customer: f.visibleToCustomer,
      sort_order: i + 1,
    }));
    const { error: fErr } = await supabase.from('account_fields').insert(rows);
    if (fErr) throw fErr;
  }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function setProductActive(id, isActive) {
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
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
  }).eq('id', 1);
  if (error) throw error;
}
