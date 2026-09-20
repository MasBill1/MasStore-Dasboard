import { stockStatusOptions } from '../data/dummyData';

export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp0';
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Final price = sellPrice - discount
export function getFinalPrice(product) {
  return Math.max(0, (product.sellPrice || 0) - (product.discount || 0));
}

// Profit = finalPrice - buyPrice
export function getProfit(product) {
  return getFinalPrice(product) - (product.buyPrice || 0);
}

export function addDuration(dateStr, amount, unit) {
  const d = new Date(dateStr);
  if (unit === 'days') d.setDate(d.getDate() + Number(amount));
  else if (unit === 'weeks') d.setDate(d.getDate() + Number(amount) * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + Number(amount));
  else if (unit === 'years') d.setFullYear(d.getFullYear() + Number(amount));
  return d.toISOString().slice(0, 10);
}

export function getWarrantyStatus(expiryDate) {
  if (!expiryDate) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry >= today ? 'active' : 'expired';
}

export function unitLabel(unit, amount) {
  const map = { days: 'Hari', weeks: 'Minggu', months: 'Bulan', years: 'Tahun' };
  return `${amount} ${map[unit] || unit}`;
}

export function stockStatusMeta(value) {
  return stockStatusOptions.find((s) => s.value === value) || stockStatusOptions[0];
}

// Deterministic gradient + initials "logo tile" for a product, based on its
// name. No image upload needed — same product always gets the same look.
const GRADIENT_PALETTE = [
  ['#6D4AFF', '#4B2BBF'],
  ['#00C2A8', '#0E7C7B'],
  ['#FF6B9D', '#C2385A'],
  ['#FFA24B', '#D9711B'],
  ['#4F8EF7', '#1B4FD9'],
  ['#B24BFF', '#6D1FBF'],
  ['#25C36B', '#0E8A45'],
  ['#FF5E5E', '#C21F1F'],
];

export function getProductTile(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [from, to] = GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length];
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
  return { gradient: `linear-gradient(135deg, ${from}, ${to})`, initials: initials || '?' };
}

// Build a WhatsApp deep link (no API needed).
// If `phone` is explicitly an empty string, no number is attached and
// WhatsApp will let the user pick a contact/chat themselves.
export function buildWhatsAppLink(phone, message) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

// Replace {variable} tokens in a template string with actual values.
// Any {var} without a matching value is stripped along with its whole line
// (so optional fields like {profile} don't leave "Profile:" hanging).
export function renderTemplate(template, values) {
  const lines = template.split('\n');
  const out = [];
  for (let line of lines) {
    const tokens = line.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
    let missingRequired = false;
    let rendered = line;
    tokens.forEach((tok) => {
      const key = tok.slice(1, -1);
      if (values[key] === undefined || values[key] === null || values[key] === '') {
        missingRequired = true;
      } else {
        rendered = rendered.split(tok).join(values[key]);
      }
    });
    if (missingRequired) continue; // drop lines referencing unavailable data
    out.push(rendered);
  }
  // collapse 3+ blank lines into max 2
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function buildPricelistMessage(product, category, storeSettings) {
  const finalPrice = getFinalPrice(product);
  const stock = stockStatusMeta(product.stockStatus).label;
  const values = {
    product_name: product.name,
    category: category?.name || '',
    description: product.description,
    duration: product.duration,
    price: formatCurrency(finalPrice),
    discount: product.discount ? formatCurrency(product.discount) : '',
    stock_status: stock,
    warranty_duration: product.warrantyEnabled ? unitLabel(product.warrantyUnit, product.warrantyDuration) : 'Tanpa Garansi',
    store_name: storeSettings?.storeName || '',
  };
  const template =
`{product_name}

Durasi: {duration}
Harga: {price}
Stock: {stock_status}
Garansi: {warranty_duration}

Jika berminat silakan order.

{store_name}`;
  return renderTemplate(template, values);
}

export function groupProductsByFamily(productList) {
  const map = new Map();
  productList
    .filter((p) => p.isActive)
    .forEach((p) => {
      const key = p.familyName || p.name;
      if (!map.has(key)) {
        map.set(key, { familyName: key, categoryId: p.categoryId, description: p.description, variants: [] });
      }
      map.get(key).variants.push(p);
    });
  return Array.from(map.values()).map((g) => ({
    ...g,
    variants: [...g.variants].sort((a, b) => getFinalPrice(a) - getFinalPrice(b)),
  }));
}

export function buildOrderMessage(product, category, storeSettings, quantity = 1) {
  const finalPrice = getFinalPrice(product);
  const values = {
    product_name: product.name,
    category: category?.name || '',
    duration: product.duration,
    price: formatCurrency(finalPrice),
    quantity: String(quantity),
    total: formatCurrency(finalPrice * quantity),
    store_name: storeSettings?.storeName || '',
  };
  const template = quantity > 1
    ?
`Halo {store_name}, saya mau order:

{product_name}
Durasi: {duration}
Harga: {price} x {quantity}
Total: {total}

Apakah stock masih tersedia?`
    :
`Halo {store_name}, saya mau order:

{product_name}
Durasi: {duration}
Harga: {price}

Apakah stock masih tersedia?`;
  return renderTemplate(template, values);
}

// Combined message: proof of purchase (struk) + account credentials
// (dynamic per product's account template) in a single WhatsApp message.
export function buildAccountDeliveryMessage(sale, storeSettings) {
  const accountLines = (sale.accountTemplateSnapshot || [])
    .filter((f) => f.visibleToCustomer)
    .map((f) => `${f.label}: ${sale.accountData?.[f.key] ?? ''}`)
    .filter((l) => !l.endsWith(': '))
    .join('\n');

  const values = {
    customer_name: sale.customerName,
    transaction_id: sale.id,
    product_name: sale.productName,
    duration: sale.duration,
    quantity: String(sale.quantity),
    total: formatCurrency(sale.total),
    payment_method: sale.paymentMethod || '-',
    purchase_date: formatDate(sale.purchaseDate),
    warranty_duration: sale.warrantyDuration ? unitLabel(sale.warrantyUnit, sale.warrantyDuration) : 'Tanpa Garansi',
    warranty_expiry: sale.warrantyExpiry ? formatDate(sale.warrantyExpiry) : '-',
    warranty_terms: sale.warrantyTerms || '-',
    store_name: storeSettings?.storeName || '',
  };

  let msg =
`Halo {customer_name},

Terima kasih sudah order di {store_name}! Berikut struk & detail akun kamu.

STRUK PEMBELIAN
ID Transaksi: {transaction_id}
Produk: {product_name}
Durasi: {duration}
Qty: {quantity}
Total: {total}
Metode Bayar: {payment_method}
Tanggal: {purchase_date}

DETAIL AKUN
`;
  msg = renderTemplate(msg, values);
  msg += accountLines + '\n\n';
  msg += renderTemplate(
`GARANSI
Durasi: {warranty_duration}
Berlaku sampai: {warranty_expiry}

KETENTUAN GARANSI
{warranty_terms}

Jika mengalami kendala, silakan hubungi kami sesuai ketentuan garansi (screenshot pesan ini bisa dipakai sebagai bukti pembelian saat klaim).

Terima kasih sudah order di {store_name}.`, values);
  return msg;
}
