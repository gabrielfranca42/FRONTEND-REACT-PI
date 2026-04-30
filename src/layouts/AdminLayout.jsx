import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Users, BookOpen, LogOut } from 'lucide-react';
import { logout } from '../services/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2><Settings size={24} /> Admin Panel</h2>
        <nav className="nav-menu" style={{ flex: 1 }}>
          <Link to="/admin/cursos" className={`nav-item ${isActive('/admin/cursos')}`}>
            <BookOpen size={20} /> Cursos
          </Link>
          <Link to="/admin/coordenadores" className={`nav-item ${isActive('/admin/coordenadores')}`}>
            <Users size={20} /> Coordenadores
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
