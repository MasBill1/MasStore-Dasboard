import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppData } from '../data/AppDataContext';

export default function Settings() {
  const { storeSettings, editStoreSettings, loading } = useAppData();
  const [settings, setSettings] = useState(storeSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('store');

  useEffect(() => { setSettings(storeSettings); }, [storeSettings]);

  function set(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await editStoreSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Layout title="Settings"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="Settings">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Konfigurasi toko, branding, pricelist, dan WhatsApp.</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="tabs">
        {['store', 'branding', 'pricelist', 'trust', 'whatsapp'].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'store' ? 'Store' : t === 'branding' ? 'Branding' : t === 'pricelist' ? 'Pricelist' : t === 'trust' ? 'Trust Section' : 'WhatsApp'}
          </button>
        ))}
      </div>

      <div className="card card-pad" style={{ maxWidth: 560 }}>
        {tab === 'store' && (
          <>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="input" value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Logo Initial</label>
              <input className="input" maxLength={3} value={settings.logoInitial} onChange={(e) => set('logoInitial', e.target.value.toUpperCase())} />
              <p className="form-hint">Digunakan sebagai logo sederhana di sidebar dan PNG delivery card.</p>
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input className="input" value={settings.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="628123456789" />
            </div>
          </>
        )}

        {tab === 'branding' && (
          <>
            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <div className="flex-row">
                <input type="color" value={settings.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} style={{ width: 46, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
                <input className="input" value={settings.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Color</label>
              <div className="flex-row">
                <input type="color" value={settings.secondaryColor} onChange={(e) => set('secondaryColor', e.target.value)} style={{ width: 46, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
                <input className="input" value={settings.secondaryColor} onChange={(e) => set('secondaryColor', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {tab === 'pricelist' && (
          <>
            <div className="form-group">
              <label className="form-label">Default Footer</label>
              <textarea className="textarea" value={settings.pricelistFooter} onChange={(e) => set('pricelistFooter', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Default Warranty Text</label>
              <textarea className="textarea" value={settings.defaultWarrantyText} onChange={(e) => set('defaultWarrantyText', e.target.value)} />
            </div>
          </>
        )}

        {tab === 'trust' && (
          <>
            <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
              Statistik ini ditampilkan di section "Kenapa Memilih Kami" di halaman Katalog Customer. Isi dengan angka asli — jangan mengarang, biar kredibel.
            </p>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Jumlah Pelanggan</label>
                <input className="input" value={settings.trustCustomerCount} onChange={(e) => set('trustCustomerCount', e.target.value)} placeholder="100+" />
              </div>
              <div className="form-group">
                <label className="form-label">Rating Rata-rata</label>
                <input className="input" value={settings.trustAvgRating} onChange={(e) => set('trustAvgRating', e.target.value)} placeholder="4.9" />
              </div>
              <div className="form-group">
                <label className="form-label">Rata-rata Waktu Kirim</label>
                <input className="input" value={settings.trustDeliveryTime} onChange={(e) => set('trustDeliveryTime', e.target.value)} placeholder="< 5 Mnt" />
              </div>
              <div className="form-group">
                <label className="form-label">Persentase Garansi</label>
                <input className="input" value={settings.trustGuaranteePercent} onChange={(e) => set('trustGuaranteePercent', e.target.value)} placeholder="100%" />
              </div>
            </div>
          </>
        )}

        {tab === 'whatsapp' && (
          <p className="text-muted" style={{ fontSize: 13 }}>
            Kelola isi lengkap template pesan (Pricelist, Account Delivery, Receipt, Warranty) di halaman <strong>WhatsApp Templates</strong>.
          </p>
        )}
      </div>
    </Layout>
  );
}
