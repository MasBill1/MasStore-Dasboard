import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../data/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card card-pad" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #6D4AFF, #4B2BBF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800,
            }}
          >
            <LogIn size={20} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Admin Login</div>
          <div className="text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>Masuk untuk mengelola dashboard.</div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              name="admin-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tokokamu.com"
              required
              autoFocus
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-bwignore="true"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              name="admin-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              data-1p-ignore
              data-lpignore="true"
              data-bwignore="true"
            />
          </div>
          {error && <p className="text-danger" style={{ fontSize: 12.5, marginBottom: 14 }}>{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
