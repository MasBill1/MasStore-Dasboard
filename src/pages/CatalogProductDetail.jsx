import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Minus, Plus, ShieldCheck, Zap, BadgeCheck, Headphones } from 'lucide-react';
import { Badge, ThemeToggle, EmptyState } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import {
  formatCurrency, getFinalPrice, stockStatusMeta, unitLabel,
  groupProductsByFamily, getProductTile, buildOrderMessage, buildWhatsAppLink,
} from '../utils/helpers';

export default function CatalogProductDetail() {
  const { familyName } = useParams();
  const navigate = useNavigate();
  const { products, categories, storeSettings, loading } = useAppData();
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const group = useMemo(() => {
    const groups = groupProductsByFamily(products);
    return groups.find((g) => g.familyName === decodeURIComponent(familyName));
  }, [products, familyName]);

  if (loading) {
    return (
      <div className="public-page">
        <div className="public-container" style={{ paddingTop: 60 }}>
          <p className="text-muted">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="public-page">
        <div className="public-hero" style={{ paddingBottom: 24 }}>
          <ThemeToggle />
          <div className="public-hero-brand">
            <div className="public-hero-mark">{storeSettings.logoInitial}</div>
          </div>
          <h1>{storeSettings.storeName}</h1>
        </div>
        <div className="public-container">
          <EmptyState icon={ArrowLeft} title="Produk tidak ditemukan" text="Produk ini mungkin sudah tidak tersedia." />
          <button className="btn btn-secondary" onClick={() => navigate('/catalog')}>
            <ArrowLeft size={14} /> Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const selected = group.variants.find((v) => v.id === selectedId) || group.variants[0];
  const category = categories.find((c) => c.id === group.categoryId);
  const tile = getProductTile(group.familyName);
  const stock = stockStatusMeta(selected.stockStatus);
  const finalPrice = getFinalPrice(selected);
  const subtotal = finalPrice * quantity;
  const outOfStock = selected.stockStatus === 'out_of_stock';

  function order() {
    const message = buildOrderMessage(selected, category, storeSettings, quantity);
    window.open(buildWhatsAppLink(storeSettings.whatsappNumber, message), '_blank');
  }

  return (
    <div className="public-page">
      <div className="public-hero" style={{ paddingBottom: 24 }}>
        <ThemeToggle />
        <div className="public-hero-brand">
          <div className="public-hero-mark">{storeSettings.logoInitial}</div>
        </div>
        <h1>{storeSettings.storeName}</h1>
        <p>Akun premium terpercaya, harga bersahabat, garansi jelas.</p>
      </div>

      <div className="public-container" style={{ marginTop: -8 }}>
        <div className="flex-between mt-16" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div className="back-link" style={{ margin: 0 }} onClick={() => navigate('/catalog')}>
            <ArrowLeft size={14} /> Kembali ke Katalog
          </div>
          <div className="detail-badge-row">
            <span className="trust-badge"><Zap size={12} /> Proses Cepat</span>
            <span className="trust-badge"><ShieldCheck size={12} /> Garansi Sesuai Ketentuan</span>
          </div>
        </div>

        <div className="detail-grid">
          {/* Main info */}
          <div className="card detail-main-card">
            <div className="detail-top-row">
              <Badge tone="purple">{category?.name || ''}</Badge>
              <Badge tone={stock.tone}>{stock.label}</Badge>
            </div>

            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt="" style={{ width: '100%', maxWidth: 280, aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-lg)', margin: '16px auto 0', display: 'block' }} />
            ) : (
              <div className="product-tile" style={{ width: '100%', maxWidth: 280, aspectRatio: '1', borderRadius: 'var(--radius-lg)', fontSize: 56, background: tile.gradient, margin: '16px auto 0' }}>
                {tile.initials}
              </div>
            )}

            <div className="flex-row mt-16" style={{ gap: 6, justifyContent: 'center' }}>
              <div className="detail-title" style={{ marginTop: 0, textAlign: 'center' }}>{group.familyName}</div>
              <BadgeCheck size={19} color="var(--purple-primary)" />
            </div>
            <p className="detail-desc" style={{ textAlign: 'center' }}>{group.description}</p>

            {selected.warrantyEnabled && (
              <div className="warranty-box mt-16" style={{ textAlign: 'center' }}>
                <div className="flex-row" style={{ justifyContent: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--purple-primary)" />
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                    Bergaransi {unitLabel(selected.warrantyUnit, selected.warrantyDuration)}
                  </span>
                </div>
              </div>
            )}

            {group.variants.length > 1 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 20, marginBottom: 4, textAlign: 'center' }}>
                  Pilih Durasi
                </div>
                <div className="variant-pill-row" style={{ justifyContent: 'center' }}>
                  {group.variants.map((v) => {
                    const isActive = v.id === selected.id;
                    const isOut = v.stockStatus === 'out_of_stock';
                    return (
                      <button
                        key={v.id}
                        className={`variant-pill ${isActive ? 'active' : ''} ${isOut ? 'disabled' : ''}`}
                        disabled={isOut}
                        onClick={() => { setSelectedId(v.id); setQuantity(1); }}
                      >
                        {v.duration}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="feature-blurb-row">
              <div className="feature-blurb">
                <div className="feature-blurb-icon"><Zap size={16} /></div>
                <div>
                  <div className="feature-blurb-title">Aktivasi Cepat</div>
                  <div className="feature-blurb-sub">Diproses admin secepat mungkin</div>
                </div>
              </div>
              <div className="feature-blurb">
                <div className="feature-blurb-icon"><ShieldCheck size={16} /></div>
                <div>
                  <div className="feature-blurb-title">Garansi Jelas</div>
                  <div className="feature-blurb-sub">Sesuai ketentuan produk ini</div>
                </div>
              </div>
              <div className="feature-blurb">
                <div className="feature-blurb-icon"><Headphones size={16} /></div>
                <div>
                  <div className="feature-blurb-title">Layanan Ramah</div>
                  <div className="feature-blurb-sub">Bantuan setup lewat WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order sidebar */}
          <div className="card detail-side-card">
            <div className="detail-side-row">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt="" className="product-tile-sm" style={{ objectFit: 'cover', borderRadius: 9 }} />
              ) : (
                <div className="product-tile product-tile-sm" style={{ background: tile.gradient }}>
                  {tile.initials}
                </div>
              )}
              <div>
                <div className="detail-side-row-title">{selected.duration}</div>
                <div className="detail-side-row-sub">{group.familyName}</div>
              </div>
            </div>

            <div className="info-row"><span>Harga Satuan</span><span>{formatCurrency(finalPrice)}</span></div>
            <div className="info-row"><span>Status Stok</span><span>{stock.label}</span></div>
            {selected.warrantyEnabled && (
              <div className="info-row"><span>Masa Garansi</span><span>{unitLabel(selected.warrantyUnit, selected.warrantyDuration)}</span></div>
            )}

            <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Jumlah</div>
            <div className="qty-stepper">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={13} /></button>
              <input value={quantity} readOnly />
              <button onClick={() => setQuantity((q) => q + 1)}><Plus size={13} /></button>
            </div>

            <div className="subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-value">{formatCurrency(subtotal)}</span>
            </div>

            <button className="btn btn-primary btn-block" disabled={outOfStock} onClick={order}>
              <Send size={15} /> {outOfStock ? 'Stock Habis' : 'Order via WhatsApp'}
            </button>
            <p className="text-faint mt-8" style={{ fontSize: 11, textAlign: 'center' }}>
              Admin siap dibantu lewat WhatsApp.
            </p>
          </div>
        </div>

        <div className="public-footer mt-20">
          © {new Date().getFullYear()} {storeSettings.storeName}. {storeSettings.pricelistFooter}
        </div>
      </div>
    </div>
  );
}
