import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingCart, Wallet, TrendingUp, Receipt } from 'lucide-react';
import Layout from '../components/Layout';
import { Badge, StatCard, EmptyState } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import { formatCurrency, formatDateShort, unitLabel, getWarrantyStatus } from '../utils/helpers';

export default function Sales() {
  const { sales, products, categories, loading } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [warrantyFilter, setWarrantyFilter] = useState('all');

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (search && !(s.customerName.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))) return false;
      if (productFilter !== 'all' && s.productId !== productFilter) return false;
      if (categoryFilter !== 'all' && s.categoryName !== categories.find((c) => c.id === categoryFilter)?.name) return false;
      if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
      if (warrantyFilter !== 'all' && getWarrantyStatus(s.warrantyExpiry) !== warrantyFilter) return false;
      return true;
    });
  }, [sales, search, productFilter, categoryFilter, paymentFilter, warrantyFilter]);

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0);
  const avgOrder = sales.length ? Math.round(totalRevenue / sales.length) : 0;

  if (loading) {
    return <Layout title="Sales"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="Sales">
      <div className="page-header">
        <div>
          <div className="page-title">Sales</div>
          <div className="page-subtitle">Riwayat transaksi dan statistik penjualan.</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
            <Plus size={15} /> New Sale
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={ShoppingCart} label="Total Transactions" value={sales.length} tone="purple" />
        <StatCard icon={Wallet} label="Revenue" value={formatCurrency(totalRevenue)} tone="success" />
        <StatCard icon={TrendingUp} label="Profit" value={formatCurrency(totalProfit)} tone="warning" />
        <StatCard icon={Receipt} label="Avg Order Value" value={formatCurrency(avgOrder)} tone="info" />
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={15} />
          <input className="input" placeholder="Cari customer / ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">Semua Produk</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="all">Semua Pembayaran</option>
          <option value="Transfer">Transfer</option>
          <option value="QRIS">QRIS</option>
          <option value="E-Wallet">E-Wallet</option>
          <option value="Cash">Cash</option>
          <option value="Other">Other</option>
        </select>
        <select className="select" value={warrantyFilter} onChange={(e) => setWarrantyFilter(e.target.value)}>
          <option value="all">Semua Garansi</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Belum ada transaksi" text="Buat transaksi baru lewat tombol New Sale." />
        ) : (
          <>
            <div className="table-wrap responsive-cards">
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction ID</th><th>Customer</th><th>Product</th><th>Total</th>
                    <th>Profit</th><th>Payment</th><th>Warranty</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const wStatus = getWarrantyStatus(s.warrantyExpiry);
                    return (
                      <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/sales/${s.id}`)}>
                        <td className="table-cell-muted">{s.id}</td>
                        <td className="table-cell-strong">{s.customerName}</td>
                        <td>{s.productName}</td>
                        <td>{formatCurrency(s.total)}</td>
                        <td className="text-success">{formatCurrency(s.profit)}</td>
                        <td><Badge tone="neutral">{s.paymentMethod}</Badge></td>
                        <td><Badge tone={wStatus === 'active' ? 'success' : 'danger'}>{wStatus === 'active' ? 'Active' : 'Expired'}</Badge></td>
                        <td className="table-cell-muted">{formatDateShort(s.purchaseDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="row-cards show-mobile" style={{ padding: '0 16px 16px' }}>
              {filtered.map((s) => {
                const wStatus = getWarrantyStatus(s.warrantyExpiry);
                return (
                  <div className="row-card" key={s.id} onClick={() => navigate(`/sales/${s.id}`)}>
                    <div className="row-card-top">
                      <div className="row-card-title">{s.customerName}</div>
                      <Badge tone={wStatus === 'active' ? 'success' : 'danger'}>{wStatus === 'active' ? 'Active' : 'Expired'}</Badge>
                    </div>
                    <div className="row-card-line"><span>ID</span><span>{s.id}</span></div>
                    <div className="row-card-line"><span>Product</span><span>{s.productName}</span></div>
                    <div className="row-card-line"><span>Total</span><span>{formatCurrency(s.total)}</span></div>
                    <div className="row-card-line"><span>Date</span><span>{formatDateShort(s.purchaseDate)}</span></div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
