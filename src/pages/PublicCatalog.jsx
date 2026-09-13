import { useMemo, useState } from 'react';
import { Search, Send } from 'lucide-react';
import { Badge, ThemeToggle } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import {
  formatCurrency, getFinalPrice, stockStatusMeta, unitLabel,
  groupProductsByFamily, buildOrderMessage, buildWhatsAppLink,
} from '../utils/helpers';

function CatalogCard({ group, categories }) {
  const [selectedId, setSelectedId] = useState(group.variants[0].id);
  const selected = group.variants.find((v) => v.id === selectedId) || group.variants[0];
  const stock = stockStatusMeta(selected.stockStatus);
  const category = categories.find((c) => c.id === group.categoryId);
  const hasDiscount = selected.discount > 0;
  const { storeSettings } = useAppData();

  function order() {
    const message = buildOrderMessage(selected, category, storeSettings);
    window.open(buildWhatsAppLink(storeSettings.whatsappNumber, message), '_blank');
  }

  return (
    <div className="catalog-card">
      <div className="flex-between">
        <Badge tone="purple">{category?.name || ''}</Badge>
        <Badge tone={stock.tone}>{stock.label}</Badge>
      </div>
      <div className="catalog-card-title mt-8">{group.familyName}</div>
      <div className="catalog-card-desc">{group.description}</div>

      {group.variants.length > 1 && (
        <div className="duration-pills">
          {group.variants.map((v) => (
            <button
              key={v.id}
              className={`duration-pill ${v.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(v.id)}
            >
              {v.duration}
            </button>
          ))}
        </div>
      )}

      <div className="catalog-price-row">
        <span className="catalog-price">{formatCurrency(getFinalPrice(selected))}</span>
        {hasDiscount && <span className="catalog-price-strike">{formatCurrency(selected.sellPrice)}</span>}
        {group.variants.length === 1 && <span className="text-faint" style={{ fontSize: 12 }}>/ {selected.duration}</span>}
      </div>

      {selected.warrantyEnabled && (
        <div className="text-faint mt-4" style={{ fontSize: 11.5 }}>
          Garansi {unitLabel(selected.warrantyUnit, selected.warrantyDuration)}
        </div>
      )}

      <button
        className="btn btn-primary btn-block mt-16"
        disabled={selected.stockStatus === 'out_of_stock'}
        onClick={order}
      >
        <Send size={14} /> {selected.stockStatus === 'out_of_stock' ? 'Stock Habis' : 'Order via WhatsApp'}
      </button>
    </div>
  );
}

export default function PublicCatalog() {
  const { products, categories, storeSettings, loading } = useAppData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const groups = useMemo(() => {
    let list = groupProductsByFamily(products);
    if (search) list = list.filter((g) => g.familyName.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== 'all') list = list.filter((g) => g.categoryId === categoryFilter);
    return list;
  }, [products, search, categoryFilter]);

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
      <div className="public-hero">
        <ThemeToggle />
        <div className="public-hero-brand">
          <div className="public-hero-mark">{storeSettings.logoInitial}</div>
        </div>
        <h1>{storeSettings.storeName}</h1>
        <p>Akun premium terpercaya, harga bersahabat, garansi jelas.</p>
      </div>

      <div className="public-container">
        <div className="public-filter-bar">
          <div className="search-box">
            <Search size={15} />
            <input className="input" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="catalog-grid">
          {groups.map((g) => (
            <CatalogCard key={g.familyName} group={g} categories={categories} />
          ))}
        </div>

        <div className="public-footer">{storeSettings.pricelistFooter}</div>
      </div>
    </div>
  );
}
