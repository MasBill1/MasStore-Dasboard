import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppData } from '../data/AppDataContext';
import { getFinalPrice, formatCurrency, addDuration } from '../utils/helpers';

const paymentMethods = ['Transfer', 'QRIS', 'E-Wallet', 'Cash', 'Other'];

export default function NewSale() {
  const navigate = useNavigate();
  const { products, categories, addSale, loading } = useAppData();

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actualSellPrice, setActualSellPrice] = useState(null);
  const [payment, setPayment] = useState('Transfer');
  const [accountData, setAccountData] = useState({});
  const [saving, setSaving] = useState(false);

  const product = products.find((p) => p.id === productId);
  const template = product ? { fields: product.fields || [] } : null;
  const finalPrice = product ? getFinalPrice(product) : 0;
  const priceToUse = actualSellPrice !== null ? actualSellPrice : finalPrice;
  const total = priceToUse * quantity;
  const totalCost = (product?.buyPrice || 0) * quantity;
  const profit = total - totalCost;

  const category = product ? categories.find((c) => c.id === product.categoryId) : null;

  function selectProduct(id) {
    setProductId(id);
    setActualSellPrice(null);
    const selected = products.find((p) => p.id === id);
    const init = {};
    (selected?.fields || []).forEach((f) => { init[f.key] = ''; });
    setAccountData(init);
  }

  const canSave = useMemo(() => {
    if (!customerName.trim() || !customerWhatsapp.trim() || !product) return false;
    const requiredMissing = (template?.fields || []).some((f) => f.required && !accountData[f.key]?.trim());
    return !requiredMissing;
  }, [customerName, customerWhatsapp, product, template, accountData]);

  async function save() {
    if (!canSave || !product) return;
    const safeQuantity = quantity === '' || Number(quantity) < 1 ? 1 : Number(quantity);
    const safeTotal = priceToUse * safeQuantity;
    const safeTotalCost = (product?.buyPrice || 0) * safeQuantity;
    const safeProfit = safeTotal - safeTotalCost;
    const purchaseDate = new Date().toISOString().slice(0, 10);
    const warrantyExpiry = product.warrantyEnabled ? addDuration(purchaseDate, product.warrantyDuration, product.warrantyUnit) : null;
    const id = `TRX-${purchaseDate.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;

    setSaving(true);
    try {
      await addSale({
        id,
        customerName,
        customerWhatsapp,
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        categoryName: category?.name || '',
        duration: product.duration,
        quantity: safeQuantity,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        discount: product.discount,
        actualSellPrice: priceToUse,
        total: safeTotal,
        totalCost: safeTotalCost,
        profit: safeProfit,
        paymentMethod: payment,
        accountTemplateSnapshot: template?.fields || [],
        accountData,
        warrantyDuration: product.warrantyEnabled ? product.warrantyDuration : 0,
        warrantyUnit: product.warrantyUnit,
        warrantyTerms: product.warrantyTerms,
        warrantyInstructions: product.warrantyInstructions,
        purchaseDate,
        warrantyExpiry,
      });
      navigate(`/sales/${id}`);
    } catch (err) {
      alert('Gagal menyimpan transaksi: ' + err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <Layout title="New Sale"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="New Sale">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sales')}><ArrowLeft size={14} /> Back to Sales</button>
          <div className="page-title mt-8">New Sale</div>
          <div className="page-subtitle">Catat transaksi penjualan dan detail akun customer.</div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <h3 className="mt-4" style={{ marginBottom: 14 }}>Customer</h3>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Customer Name <span className="req">*</span></label>
                <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Budi Santoso" />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number <span className="req">*</span></label>
                <input className="input" value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value)} placeholder="628123456789" />
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ marginBottom: 14 }}>Product</h3>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Product <span className="req">*</span></label>
                <select className="select" value={productId} onChange={(e) => selectProduct(e.target.value)}>
                  <option value="">Pilih produk...</option>
                  {products.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.duration}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" min={1} className="input" value={quantity === 0 ? '' : quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))} onBlur={() => setQuantity((q) => (q === '' || q < 1 ? 1 : q))} />
              </div>
            </div>
            {product && (
              <>
                <div className="form-group">
                  <label className="form-label">Actual Selling Price <span className="form-hint" style={{ fontWeight: 400 }}>(ubah jika beri harga khusus)</span></label>
                  <input type="number" className="input" value={priceToUse === 0 ? '' : priceToUse} onChange={(e) => setActualSellPrice(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="select" value={payment} onChange={(e) => setPayment(e.target.value)}>
                    {paymentMethods.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {product && template && (
            <div className="card card-pad">
              <h3 style={{ marginBottom: 4 }}>Account Delivery</h3>
              <p className="text-faint" style={{ fontSize: 12, marginBottom: 14 }}>Field mengikuti template produk "{product.name}".</p>
              {template.fields.map((f) => (
                <div className="form-group" key={f.id}>
                  <label className="form-label">{f.label} {f.required && <span className="req">*</span>}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="textarea" value={accountData[f.key] || ''} onChange={(e) => setAccountData({ ...accountData, [f.key]: e.target.value })} />
                  ) : (
                    <input
                      type={f.type === 'password' ? 'text' : f.type === 'number' ? 'number' : 'text'}
                      className="input"
                      value={accountData[f.key] || ''}
                      onChange={(e) => setAccountData({ ...accountData, [f.key]: e.target.value })}
                      placeholder={f.label}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card card-pad" style={{ position: 'sticky', top: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Summary</h3>
            {product ? (
              <>
                <div className="row-card-line"><span>Product</span><span>{product.name}</span></div>
                <div className="row-card-line"><span>Buy Price</span><span>{formatCurrency(product.buyPrice)}</span></div>
                <div className="row-card-line"><span>Sell Price</span><span>{formatCurrency(product.sellPrice)}</span></div>
                <div className="row-card-line"><span>Discount</span><span>-{formatCurrency(product.discount)}</span></div>
                <div className="row-card-line"><span>Final Price</span><span>{formatCurrency(finalPrice)}</span></div>
                <div className="row-card-line"><span>Quantity</span><span>{quantity}</span></div>
                <div className="divider" />
                <div className="row-card-line" style={{ fontSize: 14 }}><span className="font-strong">Total</span><span className="font-strong">{formatCurrency(total)}</span></div>
                <div className="row-card-line" style={{ fontSize: 14 }}><span className="font-strong">Profit</span><span className="font-strong text-success">{formatCurrency(profit)}</span></div>
                <button className="btn btn-primary btn-block mt-20" disabled={!canSave || saving} onClick={save}>
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Transaction'}
                </button>
                {!canSave && <p className="form-hint mt-8">Lengkapi customer, produk, dan field akun wajib.</p>}
              </>
            ) : (
              <p className="text-muted" style={{ fontSize: 13 }}>Pilih produk untuk melihat ringkasan transaksi.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
