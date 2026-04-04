import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, LayoutDashboard, Clock, User, LogOut, Menu, X, Globe, ChevronDown, Activity } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/premium-register', label: 'Premium Calc', icon: Activity },
  { to: '/claims', label: 'Claims', icon: Clock },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const { isAuthenticated, logout, user, updateLanguage } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem('rakshak_lang', lng);

    if (isAuthenticated) {
      await updateLanguage(lng);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="gradient-text">Rakshak</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${location.pathname === to
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4" />
                {label === 'Premium Calc' ? label : t(`nav.${label.toLowerCase()}`)}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          
          {/* Language Selector */}
          <div className="relative flex items-center bg-white/5 border border-border/50 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary/50">
            <Globe className="w-4 h-4 text-muted mr-1.5" />
            <select 
              value={i18n.language} 
              onChange={handleLanguageChange}
              className="bg-transparent text-sm text-slate-200 outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="English" className="bg-bg text-white">English</option>
              <option value="Hindi" className="bg-bg text-white">हिंदी (Hindi)</option>
              <option value="Tamil" className="bg-bg text-white">தமிழ் (Tamil)</option>
              <option value="Telugu" className="bg-bg text-white">తెలుగు (Telugu)</option>
              <option value="Kannada" className="bg-bg text-white">ಕನ್ನಡ (Kannada)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-muted absolute right-2 pointer-events-none" />
          </div>

          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
                <div className="live-dot" />
                <span>{user?.name || 'Rider'}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-2 text-sm hidden md:flex items-center gap-2">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">{t('auth.have_account').split('?')[1].trim()}</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">{t('landing.btn_get_covered')}</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === to ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className="w-4 h-4" /> {label === 'Premium Calc' ? label : t(`nav.${label.toLowerCase()}`)}
            </Link>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
            <LogOut className="w-4 h-4" /> {t('nav.logout')}
          </button>
        </div>
      )}
    </nav>
  );
}
