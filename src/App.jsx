import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Pricelist from './pages/Pricelist';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import TransactionDetail from './pages/TransactionDetail';
import WhatsappTemplates from './pages/WhatsappTemplates';
import SettingsPage from './pages/Settings';
import PublicCatalog from './pages/PublicCatalog';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public — no login required, this is the link you share with customers */}
      <Route path="/catalog" element={<PublicCatalog />} />
      <Route path="/login" element={<Login />} />

      {/* Admin — requires login once Supabase Auth is configured */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/pricelist" element={<ProtectedRoute><Pricelist /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/sales/new" element={<ProtectedRoute><NewSale /></ProtectedRoute>} />
      <Route path="/sales/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
      <Route path="/whatsapp-templates" element={<ProtectedRoute><WhatsappTemplates /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}
