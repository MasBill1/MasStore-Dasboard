import { useState } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import Layout from '../components/Layout';
import { Modal, EmptyState } from '../components/ui';
import { useAppData } from '../data/AppDataContext';

export default function Categories() {
  const { categories, products, loading, addCategory, editCategory, removeCategory } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setName('');
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setName(cat.name);
    setModalOpen(true);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) await editCategory(editing.id, name);
      else await addCategory(name);
      setModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan kategori: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await removeCategory(deleteTarget.id);
    } catch (err) {
      alert('Gagal menghapus kategori: ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  function productCount(catId) {
    return products.filter((p) => p.categoryId === catId).length;
  }

  if (loading) {
    return <Layout title="Categories"><p className="text-muted">Memuat data...</p></Layout>;
  }

  return (
    <Layout title="Categories">
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">Kelompokkan produk berdasarkan kategori.</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Category</button>
        </div>
      </div>

      <div className="card">
        {categories.length === 0 ? (
          <EmptyState icon={Tags} title="Belum ada kategori" text="Tambahkan kategori pertama kamu." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Category</th><th>Products</th><th></th></tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="table-cell-strong">{c.name}</td>
                    <td className="table-cell-muted">{productCount(c.id)} produk</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(c)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <div className="form-group">
          <label className="form-label">Category Name <span className="req">*</span></label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Streaming" />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
        </>}
      >
        <p style={{ fontSize: 13.5 }}>Yakin ingin menghapus kategori <strong>{deleteTarget?.name}</strong>?</p>
      </Modal>
    </Layout>
  );
}
