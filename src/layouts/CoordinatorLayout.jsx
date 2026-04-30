import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, LogOut, CheckCircle } from 'lucide-react';
import { logout } from '../services/api';

export default function CoordinatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/coordinator' && location.pathname === '/coordinator') return 'active';
    if (path !== '/coordinator' && location.pathname.includes(path)) return 'active';
    return '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2><CheckCircle size={24} /> Coordenador</h2>
        <nav className="nav-menu" style={{ flex: 1 }}>
          <Link to="/coordinator" className={`nav-item ${isActive('/coordinator')}`}>
            <FileText size={20} /> Pendências
          </Link>
          <Link to="/coordinator/alunos" className={`nav-item ${isActive('/coordinator/alunos')}`}>
            <Users size={20} /> Alunos
          </Link>
        </nav>
        <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', fontSize: 'inherit' }}>
          <LogOut size={20} /> Sair
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
