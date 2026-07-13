import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === 'admin') navigate('/');
      else if (user.role === 'department') navigate('/department-dashboard');
      else navigate('/citizen-portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden pointer-events-auto"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1525 30%, #0f1a2e 60%, #0a0e1a 100%)' }}>
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', animation: 'pulse 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)', animation: 'pulse 12s ease-in-out infinite' }} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
            <Shield size={28} className="text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Nadakkave Digital Twin
          </h1>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}
          className="glass-panel p-8 space-y-6 border border-white/10"
          style={{ backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Sign In</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Enter your credentials to access the platform</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs flex items-center gap-2 animate-panel-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin / electricity_dept"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] text-[var(--text-muted)]">Demo Credentials</p>
              <div className="relative">
                <button
                  type="button"
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none flex items-center justify-between min-w-[140px]"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Select a user role...
                  <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {dropdownOpen && (
                  <ul className="absolute bottom-full right-0 mb-1 w-48 bg-[#0a0e1a] border border-white/10 rounded overflow-hidden z-50 shadow-2xl">
                    {[
                      { value: "admin:Admin@123", label: "Admin (System Admin)" },
                      { value: "public_user:Public@123", label: "Citizen (Public Portal)" },
                      { value: "electricity_dept:dept123", label: "Electricity Dept" },
                      { value: "water_dept:dept123", label: "Water Dept" },
                      { value: "road_dept:dept123", label: "Road Dept" },
                      { value: "corporation:dept123", label: "Corporation Office" },
                      { value: "health_dept:dept123", label: "Health Dept" },
                      { value: "solid_waste:dept123", label: "Solid Waste Dept" }
                    ].map(option => (
                      <li 
                        key={option.value}
                        className="px-3 py-2 text-[10px] text-white hover:bg-sky-500/20 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const [u, p] = option.value.split(':');
                          setUsername(u);
                          setPassword(p);
                          setDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-6">
          Nadakkavu Municipal Corporation © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
