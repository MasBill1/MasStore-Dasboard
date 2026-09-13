import { useEffect, useState } from 'react';
import { Save, MessageSquareText } from 'lucide-react';
import Layout from '../components/Layout';
import { Badge } from '../components/ui';
import { useAppData } from '../data/AppDataContext';
import { availableVariables } from '../data/dummyData';

export default function WhatsappTemplates() {
  const { whatsappTemplates, editWhatsappTemplate, loading } = useAppData();
  const [activeId, setActiveId] = useState(null);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeId && whatsappTemplates.length > 0) {
      setActiveId(whatsappTemplates[0].id);
      setContent(whatsappTemplates[0].content);
    }
  }, [whatsappTemplates, activeId]);

  const active = whatsappTemplates.find((t) => t.id === activeId);

  function selectTemplate(t) {
    setActiveId(t.id);
    setContent(t.content);
    setSaved(false);
  }

  function insertVariable(varName) {
    setContent((prev) => (prev || '') + `{${varName}}`);
  }

  async function save() {
    setSaving(true);
    try {
      await editWhatsappTemplate(activeId, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      alert('Gagal menyimpan template: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Layout title="WhatsApp Templates"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="WhatsApp Templates">
      <div className="page-header">
        <div>
          <div className="page-title">WhatsApp Templates</div>
          <div className="page-subtitle">Kelola template pesan otomatis untuk pricelist, delivery, struk, dan garansi.</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Templates</h3></div>
          <div style={{ padding: 8 }}>
            {whatsappTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => selectTemplate(t)}
                className="sidebar-link"
                style={{ cursor: 'pointer', background: activeId === t.id ? 'var(--purple-soft)' : 'transparent', color: activeId === t.id ? 'var(--purple-dark)' : 'var(--text)' }}
              >
                <MessageSquareText size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="text-faint" style={{ fontSize: 11 }}>{t.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {active && (
          <div className="card card-pad">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{active.name}</div>
                <Badge tone="purple">{active.type}</Badge>
              </div>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                <Save size={13} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Message Content</label>
              <textarea
                className="textarea"
                style={{ minHeight: 220, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}
                value={content}
                onChange={(e) => { setContent(e.target.value); setSaved(false); }}
              />
              <p className="form-hint">Variable yang tidak tersedia pada produk akan otomatis dihapus saat pesan dikirim.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Available Variables</label>
              <div className="flex-wrap-gap">
                {availableVariables.map((v) => (
                  <button key={v} type="button" className="btn btn-secondary btn-sm" onClick={() => insertVariable(v)}>
                    {`{${v}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
