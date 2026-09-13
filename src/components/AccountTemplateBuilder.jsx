import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { fieldTypes } from '../data/dummyData';

let idCounter = 1000;
function nextId() {
  idCounter += 1;
  return `f-${idCounter}`;
}

export default function AccountTemplateBuilder({ fields, onChange }) {
  function updateField(id, patch) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function addField() {
    onChange([
      ...fields,
      {
        id: nextId(),
        label: '',
        key: '',
        type: 'text',
        required: true,
        visibleToCustomer: true,
        sortOrder: fields.length + 1,
      },
    ]);
  }

  function removeField(id) {
    onChange(fields.filter((f) => f.id !== id));
  }

  function move(index, dir) {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, sortOrder: i + 1 })));
  }

  function autoKey(label) {
    return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  return (
    <div>
      {fields.length === 0 && (
        <div className="text-faint" style={{ fontSize: 12.5, padding: '10px 0' }}>
          Belum ada field. Tambahkan field akun (misalnya Email, Password) sesuai kebutuhan produk ini.
        </div>
      )}
      {fields.map((field, i) => (
        <div className="field-row" key={field.id}>
          <div style={{ color: 'var(--text-faint)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => move(i, -1)} title="Move up">
              <GripVertical size={13} />
            </button>
          </div>
          <input
            className="input"
            style={{ flex: 1.2 }}
            placeholder="Label (mis. Email)"
            value={field.label}
            onChange={(e) => {
              const label = e.target.value;
              updateField(field.id, { label, key: field.key || autoKey(label) });
            }}
          />
          <select
            className="select"
            style={{ flex: 0.8 }}
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value })}
          >
            {fieldTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="flex-row" style={{ fontSize: 11.5, gap: 5, whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
            Required
          </label>
          <label className="flex-row" style={{ fontSize: 11.5, gap: 5, whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={field.visibleToCustomer} onChange={(e) => updateField(field.id, { visibleToCustomer: e.target.checked })} />
            To Customer
          </label>
          <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeField(field.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm mt-12" onClick={addField}>
        <Plus size={14} /> Add Field
      </button>
    </div>
  );
}
