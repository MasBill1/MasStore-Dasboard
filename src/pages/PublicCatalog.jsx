import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Zap, ShieldCheck, Headphones, ChevronDown, Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import {
  formatCurrency, getFinalPrice, stockStatusMeta,
  groupProductsByFamily, getProductTile,
} from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'cheapest', label: 'Harga Terendah' },
  { value: 'expensive', label: 'Harga Tertinggi' },
  { value: 'az', label: 'Nama A-Z' },
];

const FAQS = [
  {
    q: 'Berapa lama akun saya dikirim setelah order?',
    a: 'Setelah kamu order via WhatsApp dan pembayaran dikonfirmasi, admin akan segera memproses dan mengirim detail akun langsung ke chat kamu.',
  },
  {
    q: 'Bagaimana ketentuan klaim garansi?',
    a: 'Setiap produk punya masa garansi masing-masing (lihat di halaman detail produk). Kalau ada kendala, kirim screenshot login, screenshot kendala, dan struk pembelian ke WhatsApp admin.',
  },
  {
    q: 'Apakah akun bisa dipakai di semua perangkat?',
    a: 'Sebagian besar produk kompatibel dengan HP, tablet, dan PC/laptop. Kalau ada batasan khusus, biasanya sudah dijelaskan di deskripsi produk.',
  },
  {
    q: 'Bagaimana kalau saya butuh bantuan admin?',
    a: 'Tim kami siap dibantu lewat WhatsApp. Tinggal klik tombol Order via WhatsApp di produk manapun untuk mulai chat.',
  },
];

function ProductCard({ group, categories, onClick }) {
  const cheapest = group.variants[0];
  const category = categories.find((c) => c.id === group.categoryId);
  const stock = stockStatusMeta(cheapest.stockStatus);
  const tile = getProductTile(group.familyName);
  const descLine = (group.description || '').split('\n')[0];

  return (
    <div className="product-card-v3" onClick={onClick}>
      <div className="product-card-v3-media">
        {cheapest.imageUrl ? (
          <img src={cheapest.imageUrl} alt="" />
        ) : (
          <div className="product-tile" style={{ background: tile.gradient }}>{tile.initials}</div>
        )}
        <div className="product-card-v3-badges">
          <span className="badge badge-purple">{category?.name || ''}</span>
          <span className={`badge badge-${stock.tone}`}>{stock.label}</span>
        </div>
      </div>
      <div className="product-card-v3-body">
        <div className="product-card-v3-title">{group.familyName}</div>
        {descLine && <div className="product-card-v3-desc">{descLine}</div>}
        <div className="product-card-v3-bottom">
          <div>
            <div className="product-card-v3-price-label">{group.variants.length > 1 ? 'Mulai dari' : cheapest.duration}</div>
            <div className="product-card-v3-price">{formatCurrency(getFinalPrice(cheapest))}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PublicCatalog() {
  const { products, categories, storeSettings, loading } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [openFaq, setOpenFaq] = useState(null);

  const allGroups = useMemo(() => groupProductsByFamily(products), [products]);

  const featured = useMemo(() => {
    const active = products.filter((p) => p.isActive && p.stockStatus !== 'out_of_stock');
    if (active.length === 0) return null;
    return [...active].sort((a, b) => getFinalPrice(a) - getFinalPrice(b))[0];
  }, [products]);

  const groups = useMemo(() => {
    let list = allGroups;
    if (search) list = list.filter((g) => g.familyName.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== 'all') list = list.filter((g) => g.categoryId === categoryFilter);

    const sorted = [...list];
    if (sort === 'cheapest') sorted.sort((a, b) => getFinalPrice(a.variants[0]) - getFinalPrice(b.variants[0]));
    else if (sort === 'expensive') sorted.sort((a, b) => getFinalPrice(b.variants[0]) - getFinalPrice(a.variants[0]));
    else if (sort === 'az') sorted.sort((a, b) => a.familyName.localeCompare(b.familyName));
    else sorted.sort((a, b) => (b.variants[0].createdAt || '').localeCompare(a.variants[0].createdAt || ''));
    return sorted;
  }, [allGroups, search, categoryFilter, sort]);

  function goToProduct(familyName) {
    navigate(`/catalog/${encodeURIComponent(familyName)}`);
  }

  if (loading) {
    return (
      <div className="public-page">
        <div className="public-container" style={{ paddingTop: 60 }}>
          <p className="text-muted">Memuat katalog...</p>
        </div>
      </div>
    );
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
        <div className="landing-search-row">
          <div className="search-box">
            <Search size={15} />
            <input className="input" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Hero banner */}
        <div className="hero-card">
          <div>
            <div className="flash-tag"><Zap size={13} /> Produk Pilihan Terpercaya</div>
            <div className="hero-headline">
              Pusat Akun Premium <span className="accent">Murah,</span><br />Legal &amp; Bergaransi
            </div>
            <p className="hero-subtext">{storeSettings.pricelistFooter || 'Akses layanan streaming, editing, produktivitas dan lainnya dengan harga bersahabat dan garansi jelas.'}</p>
            <div className="hero-mini-features">
              <div className="hero-mini-feature">Proses Cepat<div className="hero-mini-feature-sub">Dikirim manual oleh admin</div></div>
              <div className="hero-mini-feature">Garansi Jelas<div className="hero-mini-feature-sub">Sesuai ketentuan produk</div></div>
              <div className="hero-mini-feature">Support WhatsApp<div className="hero-mini-feature-sub">Tanya-tanya dulu, gapapa</div></div>
            </div>
          </div>
          {featured && (
            <div className="featured-card" onClick={() => goToProduct(featured.familyName)}>
              <div className="featured-card-icon"><Sparkles size={18} /></div>
              <div className="featured-card-label">Penawaran Spesial</div>
              <div className="featured-card-name">{featured.name}</div>
              <div className="featured-card-price">Mulai dari <strong>{formatCurrency(getFinalPrice(featured))}</strong></div>
              <button className="btn btn-primary btn-sm btn-block mt-12">Jelajahi Produk</button>
            </div>
          )}
        </div>

        {/* Category pills */}
        <div className="category-pill-row">
          <button className={`category-pill ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>Semua Kategori</button>
          {categories.map((c) => (
            <button key={c.id} className={`category-pill ${categoryFilter === c.id ? 'active' : ''}`} onClick={() => setCategoryFilter(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="catalog-toolbar">
          <div className="search-box" style={{ maxWidth: 260 }}>
            <Search size={15} />
            <input className="input" placeholder="Cari produk seperti Netflix, Canva..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Product grid */}
        <div className="product-grid-v3">
          {groups.map((g) => (
            <ProductCard key={g.familyName} group={g} categories={categories} onClick={() => goToProduct(g.familyName)} />
          ))}
        </div>

        {/* Trust section */}
        <div className="trust-card">
          <div className="trust-card-title">Kenapa Memilih Kami?</div>
          <p className="trust-card-sub">Kami mengutamakan kepercayaan pelanggan dengan proses transparan dan garansi yang jelas untuk setiap transaksi.</p>
          <div className="trust-stat-grid">
            <div><div className="trust-stat-value">{storeSettings.trustCustomerCount}</div><div className="trust-stat-label">Pelanggan Puas</div></div>
            <div><div className="trust-stat-value">{storeSettings.trustAvgRating}★</div><div className="trust-stat-label">Rating Rata-rata</div></div>
            <div><div className="trust-stat-value">{storeSettings.trustDeliveryTime}</div><div className="trust-stat-label">Rata-rata Pengiriman</div></div>
            <div><div className="trust-stat-value">{storeSettings.trustGuaranteePercent}</div><div className="trust-stat-label">Garansi Terproteksi</div></div>
          </div>
          <div className="feature-blurb-row">
            <div className="feature-blurb">
              <div className="feature-blurb-icon"><Zap size={16} /></div>
              <div>
                <div className="feature-blurb-title">Aktivasi Cepat</div>
                <div className="feature-blurb-sub">Akun diproses admin secepat mungkin</div>
              </div>
            </div>
            <div className="feature-blurb">
              <div className="feature-blurb-icon"><ShieldCheck size={16} /></div>
              <div>
                <div className="feature-blurb-title">Garansi Jelas</div>
                <div className="feature-blurb-sub">Kendala akun ditangani sesuai ketentuan</div>
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

        {/* FAQ */}
        <div className="faq-section">
          <div className="faq-title">Pertanyaan Sering Diajukan</div>
          {FAQS.map((f, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }} />
              </div>
              {openFaq === i && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>

        <div className="public-footer">
          © {new Date().getFullYear()} {storeSettings.storeName}. {storeSettings.pricelistFooter}
        </div>
      </div>
    </div>
  );
}
