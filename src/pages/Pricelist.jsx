import { useMemo, useRef, useState } from 'react';
import { Search, Send, ImageDown, ListOrdered } from 'lucide-react';
import { toPng } from 'html-to-image';
import Layout from '../components/Layout';
import { Badge, EmptyState, Modal } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import { formatCurrency, getFinalPrice, stockStatusMeta, buildPricelistMessage, buildWhatsAppLink, unitLabel } from '../utils/helpers';

export default function Pricelist() {
  const { products, categories, storeSettings, loading } = useAppData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pngProduct, setPngProduct] = useState(null);
  const [waProduct, setWaProduct] = useState(null);
  const [waNumber, setWaNumber] = useState('');
  const cardRef = useRef(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [search, categoryFilter]);

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || '-';
  }

  function openWaModal(product) {
    setWaProduct(product);
    setWaNumber('');
  }

  function confirmSendWhatsApp() {
    const category = categories.find((c) => c.id === waProduct.categoryId);
    const message = buildPricelistMessage(waProduct, category, storeSettings);
    // Pass '' explicitly when left blank -> opens WhatsApp contact picker
    // instead of defaulting back to the store's own number.
    window.open(buildWhatsAppLink(waNumber.trim(), message), '_blank');
    setWaProduct(null);
  }

  async function generatePng(product) {
    setPngProduct(product);
    // wait a tick for the hidden card to render with new data
    setTimeout(async () => {
      if (!cardRef.current) return;
      try {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `${product.name.replace(/\s+/g, '_')}_pricelist.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate PNG', err);
      } finally {
        setPngProduct(null);
      }
    }, 50);
  }

  if (loading) {
    return <Layout title="Pricelist"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="Pricelist">
      <div className="page-header">
        <div>
          <div className="page-title">Pricelist</div>
          <div className="page-subtitle">Halaman cepat untuk melayani pertanyaan customer.</div>
        </div>
        <div className="page-header-actions">
          <a className="btn btn-secondary" href="#/catalog" target="_blank" rel="noreferrer">
            Lihat Katalog Customer
          </a>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={15} />
          <input className="input" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={ListOrdered} title="Tidak ada produk" text="Coba ubah pencarian atau filter kategori." /></div>
      ) : (
        <div className="grid-cols-3">
          {filtered.map((p) => {
            const stock = stockStatusMeta(p.stockStatus);
            return (
              <div className="card card-pad" key={p.id}>
                <div className="flex-between">
                  <Badge tone="purple">{categoryName(p.categoryId)}</Badge>
                  <Badge tone={stock.tone}>{stock.label}</Badge>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 12 }}>{p.name}</div>
                <div className="text-muted mt-4" style={{ fontSize: 12.5, minHeight: 32 }}>{p.description}</div>
                <div className="divider" />
                <div className="flex-between">
                  <span className="text-faint" style={{ fontSize: 12 }}>Durasi</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.duration}</span>
                </div>
                <div className="flex-between mt-8">
                  <span className="text-faint" style={{ fontSize: 12 }}>Harga</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple-dark)' }}>{formatCurrency(getFinalPrice(p))}</span>
                </div>
                {p.warrantyEnabled && (
                  <div className="flex-between mt-8">
                    <span className="text-faint" style={{ fontSize: 12 }}>Garansi</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{unitLabel(p.warrantyUnit, p.warrantyDuration)}</span>
                  </div>
                )}
                <div className="flex-row mt-16">
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => openWaModal(p)}>
                    <Send size={13} /> Send WA
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => generatePng(p)}>
                    <ImageDown size={13} /> Generate PNG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Choose which WhatsApp number to send to */}
      <Modal
        open={!!waProduct}
        onClose={() => setWaProduct(null)}
        title="Send via WhatsApp"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setWaProduct(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={confirmSendWhatsApp}>
              <Send size={14} /> Open WhatsApp
            </button>
          </>
        }
      >
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Kirim pricelist <strong>{waProduct?.name}</strong> ke nomor customer.
        </p>
        <div className="form-group">
          <label className="form-label">Nomor WhatsApp Customer</label>
          <input
            className="input"
            placeholder="628123456789 (kosongkan untuk pilih kontak di WhatsApp)"
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
          />
          <p className="form-hint">Kosongkan field ini kalau mau langsung pilih chat/kontak dari daftar WhatsApp kamu.</p>
        </div>
      </Modal>

      {/* Hidden off-screen card used to render the PNG */}
      <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
        {pngProduct && (
          <div
            ref={cardRef}
            style={{
              width: 480, padding: 32, background: 'linear-gradient(160deg, #6D4AFF, #4B2BBF)',
              fontFamily: 'Inter, sans-serif', color: '#fff', borderRadius: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {storeSettings.logoInitial}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{storeSettings.storeName}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{pngProduct.name}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{pngProduct.description}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '18px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ opacity: 0.75 }}>Durasi</span><span style={{ fontWeight: 700 }}>{pngProduct.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ opacity: 0.75 }}>Stock</span><span style={{ fontWeight: 700 }}>{stockStatusMeta(pngProduct.stockStatus).label}</span>
              </div>
              {pngProduct.warrantyEnabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ opacity: 0.75 }}>Garansi</span><span style={{ fontWeight: 700 }}>{unitLabel(pngProduct.warrantyUnit, pngProduct.warrantyDuration)}</span>
                </div>
              )}
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 14 }}>{formatCurrency(getFinalPrice(pngProduct))}</div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 18, textAlign: 'center' }}>{storeSettings.pricelistFooter}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
