import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Power, ImageUp, X as XIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { Badge, Modal, EmptyState } from '../components/ui';
import AccountTemplateBuilder from '../components/AccountTemplateBuilder';
import { useAppData } from '../data/AppDataContext';
import { isSupabaseConfigured } from '../lib/config';
import { uploadProductImage } from '../lib/api';
import { formatCurrency, getFinalPrice, getProfit, stockStatusMeta, getProductTile } from '../utils/helpers';

const emptyProduct = {
  id: null,
  name: '',
  familyName: '',
  categoryId: '',
  description: '',
  duration: '',
  buyPrice: 0,
  sellPrice: 0,
  discount: 0,
  stockStatus: 'in_stock',
  warrantyEnabled: true,
  warrantyDuration: 7,
  warrantyUnit: 'days',
  warrantyTerms: '',
  warrantyInstructions: '',
  imageUrl: null,
  isActive: true,
  fields: [],
};

export default function Products() {
  const { products, categories, loading, addProduct, editProduct, removeProduct, toggleProductActive } = useAppData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) {
      alert('Upload gambar butuh koneksi ke Supabase (isi .env / Vercel Environment Variables dulu).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      alert('Gagal upload gambar: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      if (stockFilter !== 'all' && p.stockStatus !== stockFilter) return false;
      if (statusFilter !== 'all' && (statusFilter === 'active') !== p.isActive) return false;
      return true;
    });
  }, [products, search, categoryFilter, stockFilter, statusFilter]);

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || '-';
  }

  function openAdd() {
    if (categories.length === 0) {
      alert('Buat Category dulu sebelum menambahkan produk (menu Categories di sidebar).');
      return;
    }
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || '', fields: [] });
    setActiveTab('general');
    setModalOpen(true);
  }

  function openEdit(product) {
    setForm({ ...product, fields: (product.fields || []).map((f) => ({ ...f })) });
    setActiveTab('general');
    setModalOpen(true);
  }

  async function saveProduct() {
    if (!form.name.trim()) return;
    if (!form.categoryId) {
      alert('Pilih Category dulu (tab General). Kalau belum ada, buat dulu di menu Categories.');
      setActiveTab('general');
      return;
    }
    const payload = { ...form, familyName: form.familyName?.trim() || form.name.trim() };
    setSaving(true);
    try {
      if (form.id) await editProduct(form.id, payload);
      else await addProduct(payload);
      setModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan produk: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product) {
    try {
      await toggleProductActive(product);
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  }

  async function confirmDelete() {
    try {
      await removeProduct(deleteTarget.id);
    } catch (err) {
      alert('Gagal menghapus produk: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) {
    return <Layout title="Products"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="Products">
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Kelola produk premium, harga, stock, dan template akun.</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="card card-pad" style={{ background: 'var(--warning-soft)', border: '1px solid #F0DCA8', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 600 }}>
            Belum ada Category. Buat minimal 1 category dulu di menu <strong>Categories</strong> sebelum menambahkan produk.
          </p>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-box">
          <Search size={15} />
          <input className="input" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">Semua Stock</option>
          <option value="in_stock">Tersedia</option>
          <option value="low_stock">Stok Menipis</option>
          <option value="out_of_stock">Habis</option>
        </select>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="Belum ada produk" text="Coba ubah filter atau tambahkan produk baru." />
        ) : (
          <>
            <div className="table-wrap responsive-cards">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Final Price</th>
                    <th>Profit</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const stock = stockStatusMeta(p.stockStatus);
                    const tile = getProductTile(p.familyName || p.name);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex-row">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="product-tile-sm" style={{ objectFit: 'cover', borderRadius: 9 }} />
                            ) : (
                              <div className="product-tile product-tile-sm" style={{ background: tile.gradient }}>{tile.initials}</div>
                            )}
                            <div>
                              <div className="table-cell-strong">{p.name}</div>
                              <div className="text-faint" style={{ fontSize: 11.5 }}>{p.duration}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell-muted">{categoryName(p.categoryId)}</td>
                        <td className="table-cell-strong">{formatCurrency(getFinalPrice(p))}</td>
                        <td className="text-success">{formatCurrency(getProfit(p))}</td>
                        <td><Badge tone={stock.tone}>{stock.label}</Badge></td>
                        <td><Badge tone={p.isActive ? 'purple' : 'neutral'}>{p.isActive ? 'Aktif' : 'Nonaktif'}</Badge></td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleActive(p)} title="Enable/Disable">
                              <Power size={14} />
                            </button>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(p)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="row-cards show-mobile" style={{ padding: '0 16px 16px' }}>
              {filtered.map((p) => {
                const stock = stockStatusMeta(p.stockStatus);
                const tile = getProductTile(p.familyName || p.name);
                return (
                  <div className="row-card" key={p.id}>
                    <div className="row-card-top">
                      <div className="flex-row">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="product-tile-sm" style={{ objectFit: 'cover', borderRadius: 9 }} />
                        ) : (
                          <div className="product-tile product-tile-sm" style={{ background: tile.gradient }}>{tile.initials}</div>
                        )}
                        <div className="row-card-title">{p.name}</div>
                      </div>
                      <Badge tone={p.isActive ? 'purple' : 'neutral'}>{p.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                    </div>
                    <div className="row-card-line"><span>Category</span><span>{categoryName(p.categoryId)}</span></div>
                    <div className="row-card-line"><span>Final Price</span><span>{formatCurrency(getFinalPrice(p))}</span></div>
                    <div className="row-card-line"><span>Profit</span><span>{formatCurrency(getProfit(p))}</span></div>
                    <div className="row-card-line"><span>Stock</span><span><Badge tone={stock.tone}>{stock.label}</Badge></span></div>
                    <div className="row-card-actions">
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(p)}><Pencil size={13} /> Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Product' : 'Add Product'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProduct} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
          </>
        }
      >
        <div className="tabs">
          {['general', 'pricing', 'warranty', 'account'].map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'general' ? 'General' : tab === 'pricing' ? 'Pricing & Stock' : tab === 'warranty' ? 'Warranty' : 'Account Template'}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <>
            <div className="flex-row" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
              {form.imageUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="product-tile-md"
                    style={{ objectFit: 'cover', borderRadius: 14 }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-icon btn-sm"
                    style={{ position: 'absolute', top: -8, right: -8, borderRadius: '50%' }}
                    onClick={() => setForm({ ...form, imageUrl: null })}
                    title="Hapus gambar"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ) : (
                (() => {
                  const tile = getProductTile(form.familyName || form.name || '?');
                  return <div className="product-tile product-tile-md" style={{ background: tile.gradient }}>{tile.initials}</div>;
                })()
              )}
              <div style={{ flex: 1 }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <ImageUp size={14} /> {uploadingImage ? 'Uploading...' : form.imageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} disabled={uploadingImage} />
                </label>
                <p className="text-faint mt-8" style={{ fontSize: 11.5 }}>
                  {form.imageUrl
                    ? 'Gambar ini dipakai di Katalog Customer & Products.'
                    : 'Belum ada gambar — tile huruf otomatis dipakai sebagai fallback. Max 5MB.'}
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Product Name <span className="req">*</span></label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Netflix Premium" />
            </div>
            <div className="form-group">
              <label className="form-label">Product Group</label>
              <input className="input" value={form.familyName} onChange={(e) => setForm({ ...form, familyName: e.target.value })} placeholder="Netflix Premium" />
              <p className="form-hint">Produk dengan Product Group yang sama akan digabung jadi satu card di Katalog Customer (durasi jadi pilihan). Kosongkan untuk pakai Product Name.</p>
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="1 Bulan" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <>
            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">Buy Price</label>
                <input type="number" className="input" value={form.buyPrice === 0 ? '' : form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Sell Price</label>
                <input type="number" className="input" value={form.sellPrice === 0 ? '' : form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount</label>
                <input type="number" className="input" value={form.discount === 0 ? '' : form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--purple-soft-2)', border: 'none' }}>
              <div className="flex-between">
                <span className="text-muted" style={{ fontSize: 12.5 }}>Final Price</span>
                <span className="font-strong">{formatCurrency(getFinalPrice(form))}</span>
              </div>
              <div className="flex-between mt-8">
                <span className="text-muted" style={{ fontSize: 12.5 }}>Profit (admin only)</span>
                <span className="font-strong text-success">{formatCurrency(getProfit(form))}</span>
              </div>
            </div>
            <div className="form-group mt-16">
              <label className="form-label">Stock Status</label>
              <select className="select" value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}>
                <option value="in_stock">Tersedia</option>
                <option value="low_stock">Stok Menipis</option>
                <option value="out_of_stock">Habis</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'warranty' && (
          <>
            <label className="flex-row" style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={form.warrantyEnabled} onChange={(e) => setForm({ ...form, warrantyEnabled: e.target.checked })} />
              <span className="form-label" style={{ margin: 0 }}>Enable Warranty</span>
            </label>
            {form.warrantyEnabled && (
              <>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input type="number" className="input" value={form.warrantyDuration === 0 ? '' : form.warrantyDuration} onChange={(e) => setForm({ ...form, warrantyDuration: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="select" value={form.warrantyUnit} onChange={(e) => setForm({ ...form, warrantyUnit: e.target.value })}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty Terms</label>
                  <textarea className="textarea" value={form.warrantyTerms} onChange={(e) => setForm({ ...form, warrantyTerms: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Claim Instructions</label>
                  <textarea className="textarea" value={form.warrantyInstructions} onChange={(e) => setForm({ ...form, warrantyInstructions: e.target.value })} placeholder={'1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.'} />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'account' && (
          <>
            <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
              Setiap produk punya field akun sendiri. Field ini yang akan diisi saat transaksi penjualan.
            </p>
            <AccountTemplateBuilder fields={form.fields} onChange={(fields) => setForm({ ...form, fields })} />
          </>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p style={{ fontSize: 13.5 }}>
          Yakin ingin menghapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </Layout>
  );
}
