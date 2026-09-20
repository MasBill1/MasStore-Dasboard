import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import {
  ArrowLeft, Eye, EyeOff, Copy, Send, ImageDown, ShieldCheck, ShieldAlert, Check, Trash2,
} from 'lucide-react';
import Layout from '../components/Layout';
import { Badge, EmptyState, Modal } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import {
  formatCurrency, formatDate, getWarrantyStatus, unitLabel,
  buildAccountDeliveryMessage, buildWhatsAppLink,
} from '../utils/helpers';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSale, removeSale, storeSettings, loading } = useAppData();
  const sale = getSale(id);
  const [visible, setVisible] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const cardRef = useRef(null);
  const [renderPng, setRenderPng] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <Layout title="Transaction"><p className="text-muted">Memuat data...</p></Layout>;
  }

  if (!sale) {
    return (
      <Layout title="Transaction">
        <EmptyState icon={ShieldAlert} title="Transaksi tidak ditemukan" text="Transaksi mungkin sudah dihapus atau ID salah." />
      </Layout>
    );
  }

  const wStatus = getWarrantyStatus(sale.warrantyExpiry);

  function toggleVisible(key) {
    setVisible((v) => ({ ...v, [key]: !v[key] }));
  }

  function copyValue(key, value) {
    navigator.clipboard?.writeText(value || '');
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function copyAll() {
    const lines = sale.accountTemplateSnapshot.map((f) => `${f.label}: ${sale.accountData?.[f.key] ?? ''}`).join('\n');
    navigator.clipboard?.writeText(lines);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 1500);
  }

  function sendAccountWhatsApp() {
    const message = buildAccountDeliveryMessage(sale, storeSettings);
    window.open(buildWhatsAppLink(sale.customerWhatsapp, message), '_blank');
  }

  async function generatePng() {
    setRenderPng(true);
    setTimeout(async () => {
      if (!cardRef.current) return;
      try {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `${sale.id}_account.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate PNG', err);
      } finally {
        setRenderPng(false);
      }
    }, 50);
  }

  async function confirmDeleteSale() {
    setDeleting(true);
    try {
      await removeSale(sale.id);
      navigate('/sales');
    } catch (err) {
      alert('Gagal menghapus transaksi: ' + err.message);
      setDeleting(false);
    }
  }

  return (
    <Layout title="Transaction Detail">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sales')}><ArrowLeft size={14} /> Back to Sales</button>
          <div className="page-title mt-8">{sale.id}</div>
          <div className="page-subtitle">Dibuat pada {formatDate(sale.purchaseDate)}</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={sendAccountWhatsApp}><Send size={14} /> Send Struk & Akun via WhatsApp</button>
          <button className="btn btn-secondary" onClick={generatePng}><ImageDown size={14} /> Generate PNG</button>
          <button className="btn btn-danger" onClick={() => setDeleteConfirmOpen(true)}><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Transaction"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDeleteSale} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
          </>
        }
      >
        <p style={{ fontSize: 13.5 }}>
          Yakin ingin menghapus transaksi <strong>{sale.id}</strong> ({sale.customerName} — {sale.productName})?
          Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi laporan revenue/profit.
        </p>
      </Modal>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <h3 style={{ marginBottom: 14 }}>Customer</h3>
            <div className="row-card-line"><span>Nama</span><span>{sale.customerName}</span></div>
            <div className="row-card-line"><span>WhatsApp</span><span>{sale.customerWhatsapp}</span></div>
          </div>

          <div className="card card-pad">
            <h3 style={{ marginBottom: 14 }}>Product</h3>
            <div className="row-card-line"><span>Nama</span><span>{sale.productName}</span></div>
            <div className="row-card-line"><span>Kategori</span><span>{sale.categoryName}</span></div>
            <div className="row-card-line"><span>Durasi</span><span>{sale.duration}</span></div>
            <div className="row-card-line"><span>Quantity</span><span>{sale.quantity}</span></div>
            <div className="divider" />
            <div className="row-card-line"><span>Total</span><span className="font-strong">{formatCurrency(sale.total)}</span></div>
            <div className="row-card-line"><span>Profit</span><span className="font-strong text-success">{formatCurrency(sale.profit)}</span></div>
            <div className="row-card-line"><span>Payment</span><span><Badge tone="neutral">{sale.paymentMethod}</Badge></span></div>
          </div>

          <div className="card card-pad">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3>Account Access</h3>
              <button className="btn btn-ghost btn-sm" onClick={copyAll}>
                {copiedField === 'all' ? <Check size={13} /> : <Copy size={13} />} Copy All
              </button>
            </div>
            {sale.accountTemplateSnapshot.map((f) => {
              const value = sale.accountData?.[f.key] ?? '';
              const isSecret = f.type === 'password';
              const shown = visible[f.key];
              return (
                <div className="account-data-row" key={f.id}>
                  <div>
                    <div className="account-data-label">{f.label}</div>
                    <div className="account-data-value">
                      {isSecret && !shown ? '•'.repeat(Math.max(6, value.length)) : value}
                    </div>
                  </div>
                  <div className="account-data-actions">
                    {isSecret && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleVisible(f.key)}>
                        {shown ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copyValue(f.key, value)}>
                      {copiedField === f.key ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={`warranty-box ${wStatus === 'expired' ? 'expired' : ''}`}>
            <div className="flex-row">
              {wStatus === 'active' ? <ShieldCheck size={20} color="var(--purple-primary)" /> : <ShieldAlert size={20} color="var(--danger)" />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Warranty</div>
                <div className="text-faint" style={{ fontSize: 12 }}>{unitLabel(sale.warrantyUnit, sale.warrantyDuration)}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge tone={wStatus === 'active' ? 'success' : 'danger'}>{wStatus === 'active' ? 'Active' : 'Expired'}</Badge>
              </div>
            </div>
            <div className="warranty-grid">
              <div>
                <div className="warranty-stat-label">Purchased</div>
                <div className="warranty-stat-value">{formatDate(sale.purchaseDate)}</div>
              </div>
              <div>
                <div className="warranty-stat-label">Expires</div>
                <div className="warranty-stat-value">{sale.warrantyExpiry ? formatDate(sale.warrantyExpiry) : '-'}</div>
              </div>
            </div>
          </div>

          {sale.warrantyTerms && (
            <div className="card card-pad">
              <h3 style={{ marginBottom: 10 }}>Warranty Terms</h3>
              <p className="text-muted" style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{sale.warrantyTerms}</p>
            </div>
          )}

          {sale.warrantyInstructions && (
            <div className="card card-pad">
              <h3 style={{ marginBottom: 10 }}>Cara Klaim Garansi</h3>
              <p className="text-muted" style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{sale.warrantyInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden card for PNG generation */}
      <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
        {renderPng && (
          <div ref={cardRef} style={{ width: 480, padding: 32, background: 'linear-gradient(160deg, #6D4AFF, #4B2BBF)', fontFamily: 'Inter, sans-serif', color: '#fff', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {storeSettings.logoInitial}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{storeSettings.storeName}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{sale.productName}</div>
              <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 4 }}>Durasi: {sale.duration}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
              {sale.accountTemplateSnapshot.filter((f) => f.visibleToCustomer).map((f) => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ opacity: 0.75 }}>{f.label}</span>
                  <span style={{ fontWeight: 700 }}>{sale.accountData?.[f.key]}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
              <div style={{ fontSize: 12.5 }}>Garansi {unitLabel(sale.warrantyUnit, sale.warrantyDuration)}, berlaku sampai {sale.warrantyExpiry ? formatDate(sale.warrantyExpiry) : '-'}</div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 16, textAlign: 'center' }}>Terima kasih sudah order di {storeSettings.storeName}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
