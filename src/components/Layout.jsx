import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ui';
import { useAppData } from '../data/AppDataContext';

export default function Layout({ children, title }) {
  const [open, setOpen] = useState(false);
  const { storeSettings } = useAppData();

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-area">
        <div className="topbar">
          <button className="topbar-menu-btn" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="topbar-title">{title || storeSettings.storeName}</div>
          <ThemeToggle />
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
