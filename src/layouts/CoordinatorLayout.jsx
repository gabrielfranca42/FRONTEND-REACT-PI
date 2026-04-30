import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Users, LogOut, CheckCircle } from 'lucide-react';

export default function CoordinatorLayout() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/coordinator' && location.pathname === '/coordinator') return 'active';
    if (path !== '/coordinator' && location.pathname.includes(path)) return 'active';
    return '';
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
