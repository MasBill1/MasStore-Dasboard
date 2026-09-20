import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';
import { isSupabaseConfigured } from '../lib/config';
import { useAuth } from './AuthContext';
import {
  categories as dummyCategories,
  products as dummyProducts,
  sales as dummySales,
  whatsappTemplates as dummyWhatsappTemplates,
  storeSettings as dummyStoreSettings,
  accountTemplates,
} from './dummyData';

const AppDataContext = createContext(null);

export { isSupabaseConfigured };

function dummyProductsWithFields() {
  return dummyProducts.map((p) => ({
    ...p,
    fields: (accountTemplates[p.accountTemplateId]?.fields || []).map((f) => ({ ...f })),
  }));
}

export function AppDataProvider({ children }) {
  const { isAuthenticated, authLoading } = useAuth();
  const [categories, setCategories] = useState(isSupabaseConfigured ? [] : dummyCategories);
  const [products, setProducts] = useState(isSupabaseConfigured ? [] : dummyProductsWithFields());
  const [sales, setSales] = useState(isSupabaseConfigured ? [] : dummySales);
  const [whatsappTemplates, setWhatsappTemplates] = useState(isSupabaseConfigured ? [] : dummyWhatsappTemplates);
  const [storeSettings, setStoreSettings] = useState(dummyStoreSettings);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState(null);

  // Public-safe data (products, categories, store settings): needed by both
  // the admin dashboard and the public customer catalog, so this loads
  // regardless of login state.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const [cats, prods, settings] = await Promise.all([
          api.fetchCategories(),
          api.fetchProducts(),
          api.fetchStoreSettings(),
        ]);
        setCategories(cats);
        setProducts(prods);
        setStoreSettings(settings);
      } catch (err) {
        console.error('Gagal memuat data publik dari Supabase, pakai dummy data sebagai fallback:', err);
        setDbError(err.message || String(err));
        setCategories(dummyCategories);
        setProducts(dummyProductsWithFields());
        setStoreSettings(dummyStoreSettings);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Admin-only data (sales, whatsapp templates): only fetched once an admin
  // is actually logged in, since these tables hold customer/transaction data.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (authLoading || !isAuthenticated) return;
    (async () => {
      try {
        const [salesData, templates] = await Promise.all([
          api.fetchSales(),
          api.fetchWhatsappTemplates(),
        ]);
        setSales(salesData);
        setWhatsappTemplates(templates);
      } catch (err) {
        console.error('Gagal memuat data admin dari Supabase:', err);
        setDbError(err.message || String(err));
      }
    })();
  }, [authLoading, isAuthenticated]);

  // ---- Categories ----
  async function addCategory(name) {
    if (isSupabaseConfigured) {
      const created = await api.createCategory(name);
      setCategories((prev) => [...prev, created]);
    } else {
      setCategories((prev) => [...prev, { id: 'cat-' + Date.now(), name }]);
    }
  }
  async function editCategory(id, name) {
    if (isSupabaseConfigured) await api.updateCategory(id, name);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  }
  async function removeCategory(id) {
    if (isSupabaseConfigured) await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  // ---- Products ----
  async function addProduct(product) {
    if (isSupabaseConfigured) {
      const id = await api.createProduct(product);
      setProducts((prev) => [...prev, { ...product, id }]);
    } else {
      const id = 'prod-' + Date.now();
      setProducts((prev) => [...prev, { ...product, id, sortOrder: prev.length + 1, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) }]);
    }
  }
  async function editProduct(id, product) {
    if (isSupabaseConfigured) await api.updateProduct(id, product);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  }
  async function removeProduct(id) {
    if (isSupabaseConfigured) await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }
  async function toggleProductActive(product) {
    if (isSupabaseConfigured) await api.setProductActive(product.id, !product.isActive);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
  }

  // ---- Sales ----
  async function addSale(sale) {
    if (isSupabaseConfigured) await api.createSale(sale);
    setSales((prev) => [sale, ...prev]);
  }
  function getSale(id) {
    return sales.find((s) => s.id === id);
  }
  async function removeSale(id) {
    if (isSupabaseConfigured) await api.deleteSale(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  // ---- WhatsApp Templates ----
  async function editWhatsappTemplate(id, content) {
    if (isSupabaseConfigured) await api.updateWhatsappTemplate(id, content);
    setWhatsappTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
  }

  // ---- Store Settings ----
  async function editStoreSettings(newSettings) {
    if (isSupabaseConfigured) await api.updateStoreSettings(newSettings);
    setStoreSettings(newSettings);
  }

  const value = useMemo(
    () => ({
      loading,
      dbError,
      isSupabaseConfigured,
      categories,
      products,
      sales,
      whatsappTemplates,
      storeSettings,
      addCategory,
      editCategory,
      removeCategory,
      addProduct,
      editProduct,
      removeProduct,
      toggleProductActive,
      addSale,
      getSale,
      removeSale,
      editWhatsappTemplate,
      editStoreSettings,
    }),
    [loading, dbError, categories, products, sales, whatsappTemplates, storeSettings]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
