import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, LogOut, CheckCircle, LayoutDashboard, ChevronDown } from 'lucide-react';
import { logout, getLoggedUser, getCursos, getProfile } from '../services/api';

export default function CoordinatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(localStorage.getItem('activeCourseId') || '');

  useEffect(() => {
    const loadCursos = async () => {
      let user = getLoggedUser();
      
      try {
        // Tenta atualizar o perfil para garantir que os cursos estão em dia
        const updatedUser = await getProfile();
        user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.warn("Não foi possível atualizar o perfil, usando cache local.");
      }

      const allCursos = await getCursos();
      // Filtrar apenas os cursos do coordenador (Proteção adicionada para evitar crash se user.courses for null)
      const myCursos = allCursos.filter(c => {
        const userCourseIds = (user?.courses || []).map(id => String(id));
        return userCourseIds.includes(String(c.id));
      });
      setCursos(myCursos);

      // Se não houver curso ativo ou o ativo não for meu, pega o primeiro (Proteção adicionada)
      const userCourseIds = (user?.courses || []).map(id => String(id));
      const isAllValid = activeCourseId === 'all' && myCursos.length > 1;
      if (!activeCourseId || (!isAllValid && !userCourseIds.includes(String(activeCourseId)))) {
        if (myCursos.length > 0) {
          const firstId = String(myCursos[0].id);
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

        {/* Indicador de Versão para validar deploy */}
        <div style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          Versão v1.1.0-fix
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
