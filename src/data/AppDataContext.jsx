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

// Mode demo: kelompokkan data dummy datar (per familyName) menjadi Produk Utama -> Varian.
function dummyCatalog() {
  const groups = new Map();
  dummyProductsWithFields().forEach((p, i) => {
    const key = p.familyName || p.name;
    if (!groups.has(key)) {
      groups.set(key, {
        id: 'prod-' + key.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: key,
        slug: key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        categoryId: p.categoryId,
        description: p.description,
        imageUrl: p.imageUrl || null,
        isActive: true,
        sortOrder: i,
        variants: [],
      });
    }
    const g = groups.get(key);
    g.variants.push({
      id: p.id, productId: g.id, groupName: '', label: p.duration || p.name, duration: p.duration || '',
      buyPrice: p.buyPrice, sellPrice: p.sellPrice, discount: p.discount, stockStatus: p.stockStatus,
      warrantyEnabled: p.warrantyEnabled, warrantyDuration: p.warrantyDuration, warrantyUnit: p.warrantyUnit,
      warrantyTerms: p.warrantyTerms, warrantyInstructions: p.warrantyInstructions,
      isActive: p.isActive, sortOrder: i, fields: p.fields,
    });
    if (p.isActive) g.isActive = true;
  });
  return [...groups.values()];
}

// Bentuk datar (1 varian = 1 item) supaya halaman lama (katalog, NewSale, Pricelist)
// tetap bekerja: id = id varian, familyName = nama Produk Utama.
export function flattenCatalog(catalog) {
  const out = [];
  catalog.forEach((m) => {
    m.variants.forEach((v) => {
      const display = [v.groupName, v.label].filter(Boolean).join(' ');
      out.push({
        ...v,
        id: v.id,
        variantId: v.id,
        productId: m.id,
        name: `${m.name} ${display}`.trim(),
        familyName: m.name,
        slug: m.slug,
        categoryId: m.categoryId,
        description: m.description,
        imageUrl: m.imageUrl,
        duration: display,
        isActive: m.isActive && v.isActive,
      });
    });
  });
  return out;
}

export function AppDataProvider({ children }) {
  const { isAuthenticated, authLoading } = useAuth();
  const [categories, setCategories] = useState(isSupabaseConfigured ? [] : dummyCategories);
  const [catalog, setCatalog] = useState(isSupabaseConfigured ? [] : dummyCatalog());
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
          api.fetchCatalog(),
          api.fetchStoreSettings(),
        ]);
        setCategories(cats);
        setCatalog(prods);
        setStoreSettings(settings);
      } catch (err) {
        console.error('Gagal memuat data publik dari Supabase, pakai dummy data sebagai fallback:', err);
        setDbError(err.message || String(err));
        setCategories(dummyCategories);
        setCatalog(dummyCatalog());
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

  // ---- Produk Utama ----
  const products = useMemo(() => flattenCatalog(catalog), [catalog]);

  function productNameExists(name, exceptId = null) {
    const norm = (t) => t.toLowerCase().replace(/\s+/g, ' ').trim();
    return catalog.some((m) => m.id !== exceptId && norm(m.name) === norm(name));
  }
  async function addProduct(product) {
    if (productNameExists(product.name)) throw new Error(`Produk "${product.name.trim()}" sudah ada. Buka produk itu lalu pilih + Tambah Varian.`);
    const id = isSupabaseConfigured ? await api.createProduct(product) : 'prod-' + Date.now();
    setCatalog((prev) => [...prev, { ...product, id, name: product.name.trim(), slug: api.slugify(product.name), sortOrder: prev.length + 1, variants: [] }]);
    return id;
  }
  async function editProduct(id, product) {
    if (productNameExists(product.name, id)) throw new Error(`Produk "${product.name.trim()}" sudah ada.`);
    if (isSupabaseConfigured) await api.updateProduct(id, product);
    setCatalog((prev) => prev.map((m) => (m.id === id ? { ...m, ...product, name: product.name.trim(), slug: api.slugify(product.name), variants: m.variants } : m)));
  }
  async function removeProduct(id) {
    if (isSupabaseConfigured) await api.deleteProduct(id);
    setCatalog((prev) => prev.filter((m) => m.id !== id));
  }
  async function toggleProductActive(product) {
    if (isSupabaseConfigured) await api.setProductActive(product.id, !product.isActive);
    setCatalog((prev) => prev.map((m) => (m.id === product.id ? { ...m, isActive: !m.isActive } : m)));
  }

  // ---- Varian ----
  function mapVariants(productId, fn) {
    setCatalog((prev) => prev.map((m) => (m.id === productId ? { ...m, variants: fn(m.variants) } : m)));
  }
  async function addVariant(productId, variant) {
    const id = isSupabaseConfigured ? await api.createVariant(productId, variant) : 'var-' + Date.now();
    mapVariants(productId, (vs) => [...vs, { ...variant, id, productId, sortOrder: vs.length + 1 }]);
  }
  async function editVariant(productId, id, variant) {
    if (isSupabaseConfigured) await api.updateVariant(id, variant);
    mapVariants(productId, (vs) => vs.map((v) => (v.id === id ? { ...v, ...variant, id, productId } : v)));
  }
  async function removeVariant(productId, id) {
    if (isSupabaseConfigured) await api.deleteVariant(id);
    mapVariants(productId, (vs) => vs.filter((v) => v.id !== id));
  }
  async function toggleVariantActive(productId, variant) {
    if (isSupabaseConfigured) await api.setVariantActive(variant.id, !variant.isActive);
    mapVariants(productId, (vs) => vs.map((v) => (v.id === variant.id ? { ...v, isActive: !v.isActive } : v)));
  }

  // ---- Sales ----
  async function addSale(inputSale) {
    // NewSale memilih item datar (id = id varian): simpan produk utama + varian.
    const v = products.find((p) => p.id === inputSale.productId);
    const sale = v ? { ...inputSale, productId: v.productId, variantId: v.variantId } : inputSale;
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
      catalog,
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
      addVariant,
      editVariant,
      removeVariant,
      toggleVariantActive,
      addSale,
      getSale,
      removeSale,
      editWhatsappTemplate,
      editStoreSettings,
    }),
    [loading, dbError, categories, catalog, products, sales, whatsappTemplates, storeSettings]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
