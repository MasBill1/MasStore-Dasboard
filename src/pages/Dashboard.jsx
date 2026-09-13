import { useMemo, useState } from 'react';
import { Package, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Layout from '../components/Layout';
import { StatCard, Badge, EmptyState } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import { formatCurrency, formatDateShort, unitLabel } from '../utils/helpers';

const RANGE_OPTIONS = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: '3m', label: '3 Months', days: 90 },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Real chart series built from actual sales — days with no transactions
// simply show 0, nothing is invented.
function buildRealChartData(salesList, days) {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const daySales = salesList.filter((s) => s.purchaseDate === dateStr);
    data.push({
      date: dateStr,
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      revenue: daySales.reduce((sum, s) => sum + (s.total || 0), 0),
      profit: daySales.reduce((sum, s) => sum + (s.profit || 0), 0),
    });
  }
  return data;
}

function sumInRange(salesList, startDate, endDate, key) {
  return salesList
    .filter((s) => s.purchaseDate >= startDate && s.purchaseDate <= endDate)
    .reduce((sum, s) => sum + (s[key] || 0), 0);
}

// Compare this week vs the week before. Returns null when there's no prior
// data to compare against (so we don't fabricate a percentage out of nothing).
function weekOverWeekTrend(salesList, key) {
  const today = new Date();
  const thisWeekEnd = today.toISOString().slice(0, 10);
  const thisWeekStartDate = new Date(today); thisWeekStartDate.setDate(today.getDate() - 6);
  const thisWeekStart = thisWeekStartDate.toISOString().slice(0, 10);

  const lastWeekEndDate = new Date(today); lastWeekEndDate.setDate(today.getDate() - 7);
  const lastWeekEnd = lastWeekEndDate.toISOString().slice(0, 10);
  const lastWeekStartDate = new Date(today); lastWeekStartDate.setDate(today.getDate() - 13);
  const lastWeekStart = lastWeekStartDate.toISOString().slice(0, 10);

  const current = sumInRange(salesList, thisWeekStart, thisWeekEnd, key);
  const previous = sumInRange(salesList, lastWeekStart, lastWeekEnd, key);

  if (previous <= 0) return null; // no baseline yet, don't show a fake %
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, direction: pct >= 0 ? 'up' : 'down' };
}

export default function Dashboard() {
  const { products, sales, loading } = useAppData();
  const [range, setRange] = useState('7d');
  const days = RANGE_OPTIONS.find((r) => r.key === range).days;
  const chartData = useMemo(() => buildRealChartData(sales, days), [sales, days]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
  const salesToday = sales.filter((s) => s.purchaseDate === todayStr()).length;

  const revenueTrend = useMemo(() => weekOverWeekTrend(sales, 'total'), [sales]);
  const profitTrend = useMemo(() => weekOverWeekTrend(sales, 'profit'), [sales]);

  const bestSellers = useMemo(() => {
    const counts = {};
    sales.forEach((s) => {
      counts[s.productId] = (counts[s.productId] || 0) + s.quantity;
    });
    return Object.entries(counts)
      .map(([productId, qty]) => ({ product: products.find((p) => p.id === productId), qty }))
      .filter((x) => x.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales, products]);

  const recentSales = [...sales].sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : -1)).slice(0, 5);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <p className="text-muted">Memuat data...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Ringkasan performa toko kamu hari ini.</div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Package} label="Total Products" value={products.length} tone="purple" />
        <StatCard icon={ShoppingBag} label="Sales Today" value={salesToday} tone="info" />
        <StatCard
          icon={Wallet} label="Revenue" value={formatCurrency(totalRevenue)} tone="success"
          trend={revenueTrend ? `${revenueTrend.pct > 0 ? '+' : ''}${revenueTrend.pct}%` : undefined}
          trendDirection={revenueTrend?.direction}
        />
        <StatCard
          icon={TrendingUp} label="Profit" value={formatCurrency(totalProfit)} tone="warning"
          trend={profitTrend ? `${profitTrend.pct > 0 ? '+' : ''}${profitTrend.pct}%` : undefined}
          trendDirection={profitTrend?.direction}
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Sales Overview</h3>
              <div className="card-header-sub">Revenue &amp; profit trend</div>
            </div>
            <div className="segmented">
              {RANGE_OPTIONS.map((opt) => (
                <button key={opt.key} className={range === opt.key ? 'active' : ''} onClick={() => setRange(opt.key)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card-pad" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D4AFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6D4AFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1FAE68" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#1FAE68" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E7E4F2" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9A96AC' }} axisLine={false} tickLine={false} interval={Math.floor(days / 7)} />
                <YAxis tick={{ fontSize: 11, fill: '#9A96AC' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v, name) => [formatCurrency(v), name === 'revenue' ? 'Revenue' : 'Profit']}
                  labelStyle={{ fontSize: 12, fontWeight: 600 }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #E7E4F2', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6D4AFF" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#1FAE68" strokeWidth={2} fill="url(#profGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Best Selling Products</h3>
          </div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bestSellers.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Belum ada penjualan" text="Best seller akan muncul setelah ada transaksi." />
            ) : (
              bestSellers.map(({ product, qty }, i) => (
                <div className="flex-between" key={product.id}>
                  <div className="flex-row">
                    <div className="avatar-circle">{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{product.name}</div>
                      <div className="text-faint" style={{ fontSize: 11.5 }}>{product.duration}</div>
                    </div>
                  </div>
                  <Badge tone="purple">{qty} terjual</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card mt-20">
        <div className="card-header">
          <h3>Recent Sales</h3>
        </div>
        {recentSales.length === 0 ? (
          <div className="card-pad">
            <EmptyState icon={ShoppingBag} title="Belum ada transaksi" text="Transaksi terbaru akan muncul di sini." />
          </div>
        ) : (
          <>
            <div className="table-wrap responsive-cards">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Profit</th>
                    <th>Warranty</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id}>
                      <td className="table-cell-strong">{s.customerName}</td>
                      <td>{s.productName}</td>
                      <td>{formatCurrency(s.total)}</td>
                      <td className="text-success">{formatCurrency(s.profit)}</td>
                      <td><Badge tone="purple">{unitLabel(s.warrantyUnit, s.warrantyDuration)}</Badge></td>
                      <td className="table-cell-muted">{formatDateShort(s.purchaseDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row-cards show-mobile" style={{ padding: '0 16px 16px' }}>
              {recentSales.map((s) => (
                <div className="row-card" key={s.id}>
                  <div className="row-card-top">
                    <div className="row-card-title">{s.customerName}</div>
                    <Badge tone="purple">{unitLabel(s.warrantyUnit, s.warrantyDuration)}</Badge>
                  </div>
                  <div className="row-card-line"><span>Product</span><span>{s.productName}</span></div>
                  <div className="row-card-line"><span>Total</span><span>{formatCurrency(s.total)}</span></div>
                  <div className="row-card-line"><span>Profit</span><span>{formatCurrency(s.profit)}</span></div>
                  <div className="row-card-line"><span>Date</span><span>{formatDateShort(s.purchaseDate)}</span></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
