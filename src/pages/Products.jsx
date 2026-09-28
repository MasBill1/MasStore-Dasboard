import { Fragment, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Power, ImageUp, X as XIcon, ChevronDown, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Badge, Modal, EmptyState } from '../components/ui';
import AccountTemplateBuilder from '../components/AccountTemplateBuilder';
import { useAppData } from '../data/AppDataContext';
import { isSupabaseConfigured } from '../lib/config';
import { uploadProductImage } from '../lib/api';
import { formatCurrency, getFinalPrice, getProfit, stockStatusMeta, getProductTile } from '../utils/helpers';

const emptyProduct = { id: null, name: '', categoryId: '', description: '', imageUrl: null, isActive: true };

const emptyVariant = {
  id: null,
  groupName: '',
  label: '',
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
  isActive: true,
  fields: [],
};

export default function Products() {
  const {
    catalog, categories, loading,
    addProduct, editProduct, removeProduct, toggleProductActive,
    addVariant, editVariant, removeVariant, toggleVariantActive,
  } = useAppData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openIds, setOpenIds] = useState(() => new Set());
  const [productModal, setProductModal] = useState(false);
  const [variantModal, setVariantModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'product' | 'variant', product, variant? }
  const [form, setForm] = useState(emptyProduct);
  const [variantForm, setVariantForm] = useState(emptyVariant);
  const [variantProduct, setVariantProduct] = useState(null);
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
    return catalog.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && m.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'all' && (statusFilter === 'active') !== m.isActive) return false;
      return true;
    });
  }, [catalog, search, categoryFilter, statusFilter]);

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || '-';
  }

  function toggleOpen(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ---- Produk Utama ----
  function openAddProduct() {
    if (categories.length === 0) {
      alert('Buat Category dulu sebelum menambahkan produk (menu Categories di sidebar).');
      return;
    }
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || '' });
    setProductModal(true);
  }

  function openEditProduct(m) {
    setForm({ id: m.id, name: m.name, categoryId: m.categoryId, description: m.description, imageUrl: m.imageUrl, isActive: m.isActive });
    setProductModal(true);
  }

  async function saveProduct() {
    if (!form.name.trim()) return;
    if (!form.categoryId) {
      alert('Pilih Category dulu. Kalau belum ada, buat dulu di menu Categories.');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await editProduct(form.id, form);
      } else {
        const id = await addProduct(form);
        setOpenIds((prev) => new Set(prev).add(id));
      }
      setProductModal(false);
    } catch (err) {
      alert('Gagal menyimpan produk: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ---- Varian ----
  function openAddVariant(m) {
    setVariantProduct(m);
    setVariantForm({ ...emptyVariant, fields: [] });
    setActiveTab('general');
    setVariantModal(true);
  }

  function openEditVariant(m, v) {
    setVariantProduct(m);
    setVariantForm({ ...v, fields: (v.fields || []).map((f) => ({ ...f })) });
    setActiveTab('general');
    setVariantModal(true);
  }

  async function saveVariant() {
    if (!variantForm.label.trim()) {
      alert('Isi Label varian dulu (contoh: 1 Bulan).');
      setActiveTab('general');
      return;
    }
    setSaving(true);
    try {
      if (variantForm.id) await editVariant(variantProduct.id, variantForm.id, variantForm);
      else await addVariant(variantProduct.id, variantForm);
      setVariantModal(false);
    } catch (err) {
      alert('Gagal menyimpan varian: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function safely(fn, msg) {
    try {
      await fn();
    } catch (err) {
      alert(msg + err.message);
    }
  }

  async function confirmDelete() {
    const t = deleteTarget;
    try {
      if (t.type === 'product') await removeProduct(t.product.id);
      else await removeVariant(t.product.id, t.variant.id);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  // Varian dikelompokkan per group_name ("Member", "Owner", atau tanpa grup).
  function groupVariants(m) {
    const groups = new Map();
    m.variants.forEach((v) => {
      const key = v.groupName || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    });
    return [...groups.entries()];
  }
  const groupSuggestions = variantProduct
    ? [...new Set(variantProduct.variants.map((v) => v.groupName).filter(Boolean))]
    : [];

  if (loading) {
    return <Layout title="Products"><p className="text-muted">Memuat data...</p></Layout>;
  }

  const numInput = (key) => ({
    type: 'number',
    className: 'input',
    placeholder: '0',
    value: variantForm[key] === 0 ? '' : variantForm[key],
    onChange: (e) => setVariantForm({ ...variantForm, [key]: e.target.value === '' ? 0 : Number(e.target.value) }),
  });

  return (
    <Layout title="Products">
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Buat produk utama sekali, lalu tambahkan paketnya sebagai varian.</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAddProduct}>
            <Plus size={15} /> Tambah Produk
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
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Package} title="Belum ada produk" text="Klik Tambah Produk untuk membuat produk utama pertama, misalnya Canva." />
        </div>
      ) : (
        filtered.map((m) => {
          const tile = getProductTile(m.name);
          const open = openIds.has(m.id);
          return (
            <div className="card" key={m.id} style={{ marginBottom: 14 }}>
              <div className="flex-between" style={{ padding: 16, gap: 12, flexWrap: 'wrap' }}>
                <div className="flex-row" style={{ cursor: 'pointer', flex: 1, minWidth: 220 }} onClick={() => toggleOpen(m.id)}>
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt="" className="product-tile-sm" style={{ objectFit: 'cover', borderRadius: 9 }} />
                  ) : (
                    <div className="product-tile product-tile-sm" style={{ background: tile.gradient }}>{tile.initials}</div>
                  )}
                  <div>
                    <div className="table-cell-strong">{m.name}</div>
                    <div className="text-faint" style={{ fontSize: 11.5 }}>
                      {categoryName(m.categoryId)} · {m.variants.length} varian
                    </div>
                  </div>
                </div>
                <div className="flex-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Badge tone={m.isActive ? 'purple' : 'neutral'}>{m.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                  <button className="btn btn-primary btn-sm" onClick={() => { openAddVariant(m); setOpenIds((prev) => new Set(prev).add(m.id)); }}>
                    <Plus size={13} /> Tambah Varian
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Enable/Disable" onClick={() => safely(() => toggleProductActive(m), 'Gagal mengubah status: ')}><Power size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Edit produk" onClick={() => openEditProduct(m)}><Pencil size={14} /></button>
                  <button className="btn btn-danger btn-icon btn-sm" title="Hapus produk" onClick={() => setDeleteTarget({ type: 'product', product: m })}><Trash2 size={14} /></button>
                </div>
              </div>

              {open && (
                <div className="table-wrap">
                  {m.variants.length === 0 ? (
                    <p className="text-muted" style={{ padding: '0 16px 16px', fontSize: 13 }}>Belum ada varian. Klik Tambah Varian.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Varian</th>
                          <th>Final Price</th>
                          <th>Profit</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupVariants(m).map(([group, variants]) => (
                          <Fragment key={group || '_'}>
                            {group && (
                              <tr>
                                <td colSpan={6} className="table-cell-strong" style={{ background: 'var(--purple-soft-2)' }}>{group}</td>
                              </tr>
                            )}
                            {variants.map((v) => {
                              const stock = stockStatusMeta(v.stockStatus);
                              return (
                                <tr key={v.id}>
                                  <td className="table-cell-strong">{v.label}</td>
                                  <td className="table-cell-strong">{formatCurrency(getFinalPrice(v))}</td>
                                  <td className="text-success">{formatCurrency(getProfit(v))}</td>
                                  <td><Badge tone={stock.tone}>{stock.label}</Badge></td>
                                  <td><Badge tone={v.isActive ? 'purple' : 'neutral'}>{v.isActive ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                  <td>
                                    <div className="table-actions">
                                      <button className="btn btn-ghost btn-icon btn-sm" title="Enable/Disable" onClick={() => safely(() => toggleVariantActive(m.id, v), 'Gagal mengubah status: ')}><Power size={14} /></button>
                                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit varian" onClick={() => openEditVariant(m, v)}><Pencil size={14} /></button>
                                      <button className="btn btn-danger btn-icon btn-sm" title="Hapus varian" onClick={() => setDeleteTarget({ type: 'variant', product: m, variant: v })}><Trash2 size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Tambah / Edit Produk Utama */}
      <Modal
        open={productModal}
        onClose={() => setProductModal(false)}
        title={form.id ? 'Edit Produk' : 'Tambah Produk'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setProductModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProduct} disabled={saving}>{saving ? 'Saving...' : 'Save Produk'}</button>
          </>
        }
      >
        <div className="flex-row" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
          {form.imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img src={form.imageUrl} alt="" className="product-tile-md" style={{ objectFit: 'cover', borderRadius: 14 }} />
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
              const tile = getProductTile(form.name || '?');
              return <div className="product-tile product-tile-md" style={{ background: tile.gradient }}>{tile.initials}</div>;
            })()
          )}
          <div style={{ flex: 1 }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <ImageUp size={14} /> {uploadingImage ? 'Uploading...' : form.imageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} disabled={uploadingImage} />
            </label>
            <p className="text-faint mt-8" style={{ fontSize: 11.5 }}>Satu gambar untuk seluruh varian. Max 5MB.</p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nama Produk <span className="req">*</span></label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Canva" />
          <p className="form-hint">Dibuat sekali saja. Paket berbeda (Member, Owner, durasi) ditambahkan sebagai varian.</p>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi / Detail</label>
          <textarea className="textarea" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      {/* Tambah / Edit Varian */}
      <Modal
        open={variantModal}
        onClose={() => setVariantModal(false)}
        title={`${variantForm.id ? 'Edit Varian' : 'Tambah Varian'}${variantProduct ? ' - ' + variantProduct.name : ''}`}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setVariantModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveVariant} disabled={saving}>{saving ? 'Saving...' : 'Save Varian'}</button>
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
            <div className="form-group">
              <label className="form-label">Grup (opsional)</label>
              <input className="input" list="variant-groups" value={variantForm.groupName} onChange={(e) => setVariantForm({ ...variantForm, groupName: e.target.value })} placeholder="Member / Owner" />
              <datalist id="variant-groups">
                {groupSuggestions.map((g) => <option key={g} value={g} />)}
              </datalist>
              <p className="form-hint">Varian dengan grup yang sama ditampilkan bersama (jadi tab di katalog). Boleh dikosongkan.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Label Varian <span className="req">*</span></label>
              <input className="input" value={variantForm.label} onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value })} placeholder="1 Bulan / Edukasi Lifetime" />
            </div>
            <div className="form-group">
              <label className="form-label">Durasi (opsional)</label>
              <input className="input" value={variantForm.duration} onChange={(e) => setVariantForm({ ...variantForm, duration: e.target.value })} placeholder="1 Bulan" />
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <>
            <div className="grid-cols-3">
              <div className="form-group"><label className="form-label">Buy Price</label><input {...numInput('buyPrice')} /></div>
              <div className="form-group"><label className="form-label">Sell Price</label><input {...numInput('sellPrice')} /></div>
              <div className="form-group"><label className="form-label">Discount</label><input {...numInput('discount')} /></div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--purple-soft-2)', border: 'none' }}>
              <div className="flex-between">
                <span className="text-muted" style={{ fontSize: 12.5 }}>Final Price</span>
                <span className="font-strong">{formatCurrency(getFinalPrice(variantForm))}</span>
              </div>
              <div className="flex-between mt-8">
                <span className="text-muted" style={{ fontSize: 12.5 }}>Profit (admin only)</span>
                <span className="font-strong text-success">{formatCurrency(getProfit(variantForm))}</span>
              </div>
            </div>
            <div className="form-group mt-16">
              <label className="form-label">Stock Status</label>
              <select className="select" value={variantForm.stockStatus} onChange={(e) => setVariantForm({ ...variantForm, stockStatus: e.target.value })}>
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
              <input type="checkbox" checked={variantForm.warrantyEnabled} onChange={(e) => setVariantForm({ ...variantForm, warrantyEnabled: e.target.checked })} />
              <span className="form-label" style={{ margin: 0 }}>Enable Warranty</span>
            </label>
            {variantForm.warrantyEnabled && (
              <>
                <div className="grid-cols-2">
                  <div className="form-group"><label className="form-label">Duration</label><input {...numInput('warrantyDuration')} /></div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="select" value={variantForm.warrantyUnit} onChange={(e) => setVariantForm({ ...variantForm, warrantyUnit: e.target.value })}>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty Terms</label>
                  <textarea className="textarea" value={variantForm.warrantyTerms} onChange={(e) => setVariantForm({ ...variantForm, warrantyTerms: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Claim Instructions</label>
                  <textarea className="textarea" value={variantForm.warrantyInstructions} onChange={(e) => setVariantForm({ ...variantForm, warrantyInstructions: e.target.value })} placeholder={'1. Screenshot kendala.\n2. Kirim ke WhatsApp admin.'} />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'account' && (
          <>
            <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
              Field akun ini spesifik untuk varian dan diisi saat transaksi penjualan.
            </p>
            <AccountTemplateBuilder fields={variantForm.fields} onChange={(fields) => setVariantForm({ ...variantForm, fields })} />
          </>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.type === 'variant' ? 'Hapus Varian' : 'Hapus Produk'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p style={{ fontSize: 13.5 }}>
          {deleteTarget?.type === 'variant' ? (
            <>Yakin ingin menghapus varian <strong>{deleteTarget?.variant?.label}</strong> dari {deleteTarget?.product?.name}? Tindakan ini tidak dapat dibatalkan.</>
          ) : (
            <>Yakin ingin menghapus <strong>{deleteTarget?.product?.name}</strong> beserta <strong>semua variannya</strong>? Tindakan ini tidak dapat dibatalkan.</>
          )}
        </p>
      </Modal>
    </Layout>
  );
}
