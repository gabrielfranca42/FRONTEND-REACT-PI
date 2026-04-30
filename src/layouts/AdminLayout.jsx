import { Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, Users, BookOpen, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

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
        <Link to="/login" className="nav-item text-danger mt-4" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} /> Sair
        </Link>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
