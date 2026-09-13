import { X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../data/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function Badge({ tone = 'neutral', children, dot = false }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'purple', trend, trendDirection }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon tone-${tone}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`stat-trend ${trendDirection === 'down' ? 'down' : 'up'}`}>{trend}</span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-panel ${size === 'lg' ? 'modal-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={34} strokeWidth={1.5} />}
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-text">{text}</div>
    </div>
  );
}
