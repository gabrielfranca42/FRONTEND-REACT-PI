import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, LogOut, CheckCircle, LayoutDashboard, ChevronDown } from 'lucide-react';
import { logout, getLoggedUser, getCursos } from '../services/api';

export default function CoordinatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(localStorage.getItem('activeCourseId') || '');

  useEffect(() => {
    const loadCursos = async () => {
      const user = getLoggedUser();
      const allCursos = await getCursos();
      // Filtrar apenas os cursos do coordenador
      const myCursos = allCursos.filter(c => user.courses.includes(c.id));
      setCursos(myCursos);

      // Se não houver curso ativo ou o ativo não for meu, pega o primeiro
      if (!activeCourseId || !user.courses.includes(activeCourseId)) {
        if (myCursos.length > 0) {
          const firstId = myCursos[0].id;
          setActiveCourseId(firstId);
          localStorage.setItem('activeCourseId', firstId);
        }
      }
    };
    loadCursos();
  }, []);

  const handleCourseChange = (e) => {
    const newId = e.target.value;
    setActiveCourseId(newId);
    localStorage.setItem('activeCourseId', newId);
    // Dispara um evento customizado para avisar as páginas que o curso mudou
    window.dispatchEvent(new Event('courseChanged'));
  };

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
        
        {cursos.length > 0 && (
          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>CURSO ATIVO</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={activeCourseId} 
                onChange={handleCourseChange}
                style={{ 
                  width: '100%', 
                  padding: '0.6rem 2rem 0.6rem 0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  appearance: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {cursos.map(c => (
                  <option key={c.id} value={c.id} style={{ color: '#333' }}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
            </div>
          </div>
        )}

        <nav className="nav-menu" style={{ flex: 1 }}>
          <Link to="/coordinator" className={`nav-item ${isActive('/coordinator')}`}>
            <LayoutDashboard size={20} /> Dashboard
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
