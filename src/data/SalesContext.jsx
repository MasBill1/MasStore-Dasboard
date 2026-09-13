import { createContext, useContext, useState } from 'react';
import { sales as initialSales } from './dummyData';

const SalesContext = createContext(null);

export function SalesProvider({ children }) {
  const [sales, setSales] = useState(initialSales);

  function addSale(sale) {
    setSales((prev) => [sale, ...prev]);
  }

  function updateSale(id, patch) {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function getSale(id) {
    return sales.find((s) => s.id === id);
  }

  return (
    <SalesContext.Provider value={{ sales, addSale, updateSale, getSale }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
