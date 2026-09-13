import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Package, Tags, ListOrdered, ShoppingCart, MessageSquareText, Settings, X, LogOut,
} from 'lucide-react';
import { ThemeToggle } from './ui';
import { useAppData } from '../data/AppDataContext';
import { useAuth } from '../data/AuthContext';
import { isSupabaseConfigured } from '../lib/config';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/pricelist', label: 'Pricelist', icon: ListOrdered },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/whatsapp-templates', label: 'WhatsApp Templates', icon: MessageSquareText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { storeSettings } = useAppData();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="flex-between">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">{storeSettings.logoInitial}</div>
            <div>
              <div className="sidebar-brand-text">{storeSettings.storeName}</div>
              <div className="sidebar-brand-sub">Admin Dashboard</div>
            </div>
          </div>
          <button className="modal-close" style={{ display: open ? 'flex' : 'none' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">AD</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-admin-name">Admin</div>
            <div className="sidebar-admin-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isSupabaseConfigured && user ? user.email : 'Administrator'}
            </div>
          </div>
          <ThemeToggle />
          {isSupabaseConfigured && (
            <button className="theme-toggle" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
