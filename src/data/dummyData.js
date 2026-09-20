// ============================================================================
// Dummy data for development. Replace with real API calls when backend
// is ready. Shapes here mirror the intended DB schema described in the brief.
// ============================================================================

export const storeSettings = {
  storeName: 'NexPremium Store',
  logoInitial: 'NP',
  whatsappNumber: '628123456789',
  primaryColor: '#6D4AFF',
  secondaryColor: '#4B2BBF',
  pricelistFooter: 'Harga sewaktu-waktu dapat berubah. Order sebelum kehabisan stock ya!',
  defaultWarrantyText: 'Garansi berlaku selama masa aktif, tidak termasuk kesalahan pengguna.',
  trustCustomerCount: '100+',
  trustAvgRating: '4.9',
  trustDeliveryTime: '< 5 Mnt',
  trustGuaranteePercent: '100%',
};

export const categories = [
  { id: 'cat-streaming', name: 'Streaming' },
  { id: 'cat-design', name: 'Design Tools' },
  { id: 'cat-music', name: 'Music' },
  { id: 'cat-productivity', name: 'Productivity' },
  { id: 'cat-vpn', name: 'VPN & Security' },
];

// ----------------------------------------------------------------------------
// Account Templates — each product owns one. Fields are fully dynamic.
// ----------------------------------------------------------------------------
export const accountTemplates = {
  'tmpl-netflix': {
    id: 'tmpl-netflix',
    name: 'Netflix Account Template',
    fields: [
      { id: 'f1', label: 'Email', key: 'email', type: 'text', required: true, visibleToCustomer: true, sortOrder: 1 },
      { id: 'f2', label: 'Password', key: 'password', type: 'password', required: true, visibleToCustomer: true, sortOrder: 2 },
      { id: 'f3', label: 'Profile', key: 'profile', type: 'text', required: false, visibleToCustomer: true, sortOrder: 3 },
      { id: 'f4', label: 'PIN', key: 'pin', type: 'text', required: false, visibleToCustomer: true, sortOrder: 4 },
    ],
  },
  'tmpl-canva': {
    id: 'tmpl-canva',
    name: 'Canva Account Template',
    fields: [
      { id: 'f1', label: 'Email', key: 'email', type: 'text', required: true, visibleToCustomer: true, sortOrder: 1 },
      { id: 'f2', label: 'Access Link', key: 'access_link', type: 'url', required: true, visibleToCustomer: true, sortOrder: 2 },
    ],
  },
  'tmpl-spotify': {
    id: 'tmpl-spotify',
    name: 'Spotify Account Template',
    fields: [
      { id: 'f1', label: 'Email', key: 'email', type: 'text', required: true, visibleToCustomer: true, sortOrder: 1 },
      { id: 'f2', label: 'Password', key: 'password', type: 'password', required: true, visibleToCustomer: true, sortOrder: 2 },
    ],
  },
  'tmpl-office': {
    id: 'tmpl-office',
    name: 'Microsoft 365 Account Template',
    fields: [
      { id: 'f1', label: 'Username', key: 'username', type: 'text', required: true, visibleToCustomer: true, sortOrder: 1 },
      { id: 'f2', label: 'Password', key: 'password', type: 'password', required: true, visibleToCustomer: true, sortOrder: 2 },
      { id: 'f3', label: 'License Key', key: 'license_key', type: 'text', required: false, visibleToCustomer: true, sortOrder: 3 },
      { id: 'f4', label: 'Activation Link', key: 'activation_link', type: 'url', required: false, visibleToCustomer: false, sortOrder: 4 },
    ],
  },
  'tmpl-vpn': {
    id: 'tmpl-vpn',
    name: 'VPN Account Template',
    fields: [
      { id: 'f1', label: 'Username', key: 'username', type: 'text', required: true, visibleToCustomer: true, sortOrder: 1 },
      { id: 'f2', label: 'Password', key: 'password', type: 'password', required: true, visibleToCustomer: true, sortOrder: 2 },
      { id: 'f3', label: 'Server', key: 'server', type: 'text', required: false, visibleToCustomer: true, sortOrder: 3 },
    ],
  },
};

// ----------------------------------------------------------------------------
// Products
// ----------------------------------------------------------------------------
export const products = [
  {
    id: 'prod-netflix-1m',
    name: 'Netflix Premium',
    familyName: 'Netflix Premium',
    categoryId: 'cat-streaming',
    description: 'Akun Netflix Premium sharing, UHD 4K, 4 layar bersamaan.',
    duration: '1 Bulan',
    buyPrice: 9000,
    sellPrice: 18000,
    discount: 3000,
    stockStatus: 'in_stock',
    warrantyEnabled: true,
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Pastikan kendala terlihat jelas.\n3. Kirim bukti melalui WhatsApp.\n4. Tunggu proses pengecekan.',
    accountTemplateId: 'tmpl-netflix',
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-06-01',
    updatedAt: '2026-08-20',
  },
  {
    id: 'prod-netflix-3m',
    name: 'Netflix Premium 3 Bulan',
    familyName: 'Netflix Premium',
    categoryId: 'cat-streaming',
    description: 'Akun Netflix Premium sharing untuk 3 bulan, hemat lebih banyak.',
    duration: '3 Bulan',
    buyPrice: 24000,
    sellPrice: 48000,
    discount: 5000,
    stockStatus: 'in_stock',
    warrantyEnabled: true,
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim bukti melalui WhatsApp.\n3. Tunggu proses pengecekan.',
    accountTemplateId: 'tmpl-netflix',
    isActive: true,
    sortOrder: 2,
    createdAt: '2026-06-01',
    updatedAt: '2026-08-20',
  },
  {
    id: 'prod-canva-1y',
    name: 'Canva Pro',
    familyName: 'Canva Pro',
    categoryId: 'cat-design',
    description: 'Akun Canva Pro 1 tahun, akses semua fitur premium.',
    duration: '1 Tahun',
    buyPrice: 15000,
    sellPrice: 35000,
    discount: 0,
    stockStatus: 'in_stock',
    warrantyEnabled: true,
    warrantyDuration: 14,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi replace jika akun ter-logout otomatis.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.\n3. Akun akan diganti dalam 1x24 jam.',
    accountTemplateId: 'tmpl-canva',
    isActive: true,
    sortOrder: 3,
    createdAt: '2026-05-11',
    updatedAt: '2026-08-15',
  },
  {
    id: 'prod-spotify-1m',
    name: 'Spotify Premium',
    familyName: 'Spotify Premium',
    categoryId: 'cat-music',
    description: 'Akun Spotify Premium individu, bebas iklan, kualitas tinggi.',
    duration: '1 Bulan',
    buyPrice: 8000,
    sellPrice: 15000,
    discount: 1000,
    stockStatus: 'low_stock',
    warrantyEnabled: true,
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi replace bila akun bermasalah dari sisi kami.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.',
    accountTemplateId: 'tmpl-spotify',
    isActive: true,
    sortOrder: 4,
    createdAt: '2026-07-02',
    updatedAt: '2026-08-25',
  },
  {
    id: 'prod-office-1y',
    name: 'Microsoft 365 Personal',
    familyName: 'Microsoft 365 Personal',
    categoryId: 'cat-productivity',
    description: 'Akun Microsoft 365 lengkap dengan Word, Excel, PowerPoint, 1TB OneDrive.',
    duration: '1 Tahun',
    buyPrice: 45000,
    sellPrice: 89000,
    discount: 10000,
    stockStatus: 'in_stock',
    warrantyEnabled: true,
    warrantyDuration: 30,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi penuh selama masa aktif langganan.',
    warrantyInstructions: '1. Screenshot kendala aktivasi.\n2. Kirim ke WhatsApp admin.\n3. Tunggu proses maksimal 1x24 jam.',
    accountTemplateId: 'tmpl-office',
    isActive: true,
    sortOrder: 5,
    createdAt: '2026-04-18',
    updatedAt: '2026-08-10',
  },
  {
    id: 'prod-vpn-1m',
    name: 'NordVPN Premium',
    familyName: 'NordVPN Premium',
    categoryId: 'cat-vpn',
    description: 'Akses VPN premium kecepatan tinggi, unlimited device.',
    duration: '1 Bulan',
    buyPrice: 12000,
    sellPrice: 25000,
    discount: 0,
    stockStatus: 'out_of_stock',
    warrantyEnabled: false,
    warrantyDuration: 0,
    warrantyUnit: 'days',
    warrantyTerms: '',
    warrantyInstructions: '',
    accountTemplateId: 'tmpl-vpn',
    isActive: false,
    sortOrder: 6,
    createdAt: '2026-03-05',
    updatedAt: '2026-07-30',
  },
];

// ----------------------------------------------------------------------------
// Sales / Transactions — each stores a full immutable snapshot.
// ----------------------------------------------------------------------------
export const sales = [
  {
    id: 'TRX-20260910-001',
    customerName: 'Budi Santoso',
    customerWhatsapp: '628111222333',
    productId: 'prod-netflix-1m',
    productName: 'Netflix Premium',
    productDescription: 'Akun Netflix Premium sharing, UHD 4K, 4 layar bersamaan.',
    categoryName: 'Streaming',
    duration: '1 Bulan',
    quantity: 1,
    buyPrice: 9000,
    sellPrice: 18000,
    discount: 3000,
    actualSellPrice: 15000,
    total: 15000,
    totalCost: 9000,
    profit: 6000,
    paymentMethod: 'QRIS',
    accountTemplateSnapshot: accountTemplates['tmpl-netflix'].fields,
    accountData: { email: 'slot1.netflix@nexmail.com', password: 'Nx9!aQr2', profile: 'Profile 2', pin: '4821' },
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Pastikan kendala terlihat jelas.\n3. Kirim bukti melalui WhatsApp.\n4. Tunggu proses pengecekan.',
    purchaseDate: '2026-09-10',
    warrantyExpiry: '2026-09-17',
  },
  {
    id: 'TRX-20260910-002',
    customerName: 'Siti Nurhaliza',
    customerWhatsapp: '628222333444',
    productId: 'prod-canva-1y',
    productName: 'Canva Pro',
    productDescription: 'Akun Canva Pro 1 tahun, akses semua fitur premium.',
    categoryName: 'Design Tools',
    duration: '1 Tahun',
    quantity: 1,
    buyPrice: 15000,
    sellPrice: 35000,
    discount: 0,
    actualSellPrice: 35000,
    total: 35000,
    totalCost: 15000,
    profit: 20000,
    paymentMethod: 'Transfer',
    accountTemplateSnapshot: accountTemplates['tmpl-canva'].fields,
    accountData: { email: 'canva.slot4@nexmail.com', access_link: 'https://canva.com/invite/xyz123' },
    warrantyDuration: 14,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi replace jika akun ter-logout otomatis.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.\n3. Akun akan diganti dalam 1x24 jam.',
    purchaseDate: '2026-09-09',
    warrantyExpiry: '2026-09-23',
  },
  {
    id: 'TRX-20260908-001',
    customerName: 'Andi Wijaya',
    customerWhatsapp: '628333444555',
    productId: 'prod-office-1y',
    productName: 'Microsoft 365 Personal',
    productDescription: 'Akun Microsoft 365 lengkap dengan Word, Excel, PowerPoint, 1TB OneDrive.',
    categoryName: 'Productivity',
    duration: '1 Tahun',
    quantity: 1,
    buyPrice: 45000,
    sellPrice: 89000,
    discount: 10000,
    actualSellPrice: 79000,
    total: 79000,
    totalCost: 45000,
    profit: 34000,
    paymentMethod: 'E-Wallet',
    accountTemplateSnapshot: accountTemplates['tmpl-office'].fields,
    accountData: { username: 'andi.office365@nexmail.com', password: 'Off!ce365x', license_key: 'XJ2K9-M4NBQ-7PLRT', activation_link: 'https://office.com/activate' },
    warrantyDuration: 30,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi penuh selama masa aktif langganan.',
    warrantyInstructions: '1. Screenshot kendala aktivasi.\n2. Kirim ke WhatsApp admin.\n3. Tunggu proses maksimal 1x24 jam.',
    purchaseDate: '2026-09-08',
    warrantyExpiry: '2026-10-08',
  },
  {
    id: 'TRX-20260901-004',
    customerName: 'Dewi Lestari',
    customerWhatsapp: '628444555666',
    productId: 'prod-spotify-1m',
    productName: 'Spotify Premium',
    productDescription: 'Akun Spotify Premium individu, bebas iklan, kualitas tinggi.',
    categoryName: 'Music',
    duration: '1 Bulan',
    quantity: 2,
    buyPrice: 8000,
    sellPrice: 15000,
    discount: 1000,
    actualSellPrice: 14000,
    total: 28000,
    totalCost: 16000,
    profit: 12000,
    paymentMethod: 'Cash',
    accountTemplateSnapshot: accountTemplates['tmpl-spotify'].fields,
    accountData: { email: 'spotify.slot9@nexmail.com', password: 'Sp0tify!9x' },
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi replace bila akun bermasalah dari sisi kami.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.',
    purchaseDate: '2026-09-01',
    warrantyExpiry: '2026-09-08',
  },
  {
    id: 'TRX-20260828-002',
    customerName: 'Rizky Ramadhan',
    customerWhatsapp: '628555666777',
    productId: 'prod-netflix-3m',
    productName: 'Netflix Premium 3 Bulan',
    productDescription: 'Akun Netflix Premium sharing untuk 3 bulan, hemat lebih banyak.',
    categoryName: 'Streaming',
    duration: '3 Bulan',
    quantity: 1,
    buyPrice: 24000,
    sellPrice: 48000,
    discount: 5000,
    actualSellPrice: 43000,
    total: 43000,
    totalCost: 24000,
    profit: 19000,
    paymentMethod: 'Transfer',
    accountTemplateSnapshot: accountTemplates['tmpl-netflix'].fields,
    accountData: { email: 'slot2.netflix@nexmail.com', password: 'Nx7!bTr5', profile: 'Profile 1', pin: '1190' },
    warrantyDuration: 7,
    warrantyUnit: 'days',
    warrantyTerms: 'Garansi berlaku untuk kendala login, bukan kesalahan pengguna.',
    warrantyInstructions: '1. Screenshot kendala.\n2. Kirim bukti melalui WhatsApp.',
    purchaseDate: '2026-08-28',
    warrantyExpiry: '2026-09-04',
  },
];

// ----------------------------------------------------------------------------
// WhatsApp Templates
// ----------------------------------------------------------------------------
export const whatsappTemplates = [
  {
    id: 'wa-pricelist',
    type: 'Pricelist',
    name: 'Pricelist Default',
    content:
`{product_name}

Durasi: {duration}
Harga: {price}
Stock: {stock_status}
Garansi: {warranty_duration}

Jika berminat silakan order.

{store_name}`,
  },
  {
    id: 'wa-delivery',
    type: 'Account Delivery',
    name: 'Account Delivery Default',
    content:
`Halo {customer_name},

Terima kasih sudah order di {store_name}! Berikut struk & detail akun kamu.

STRUK PEMBELIAN
ID Transaksi: {transaction_id}
Produk: {product_name}
Durasi: {duration}
Total: {total}
Tanggal: {purchase_date}

DETAIL AKUN
{email}
{password}

GARANSI
Durasi: {warranty_duration}
Berlaku sampai: {warranty_expiry}

KETENTUAN GARANSI
{warranty_terms}

Jika mengalami kendala, silakan hubungi kami sesuai ketentuan garansi.

Terima kasih sudah order di {store_name}.`,
  },
  {
    id: 'wa-receipt',
    type: 'Receipt',
    name: 'Struk Pembelian',
    content:
`Terima kasih {customer_name}!

ID Transaksi: {transaction_id}
Produk: {product_name}
Qty: {quantity}
Total: {total}
Tanggal: {purchase_date}

{store_name}`,
  },
  {
    id: 'wa-warranty',
    type: 'Warranty',
    name: 'Info Garansi',
    content:
`Halo {customer_name},

Info garansi untuk pembelian {product_name}:

Berlaku sampai: {warranty_expiry}

Ketentuan:
{warranty_terms}

{store_name}`,
  },
];

export const availableVariables = [
  'product_name', 'category', 'description', 'duration', 'price', 'discount',
  'stock_status', 'customer_name', 'customer_whatsapp', 'transaction_id',
  'quantity', 'purchase_date', 'total', 'warranty_duration', 'warranty_expiry',
  'warranty_terms', 'store_name',
];

export const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'password', label: 'Password' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
];

export const stockStatusOptions = [
  { value: 'in_stock', label: 'Tersedia', tone: 'success' },
  { value: 'low_stock', label: 'Stok Menipis', tone: 'warning' },
  { value: 'out_of_stock', label: 'Habis', tone: 'danger' },
];
