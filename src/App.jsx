import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import CoordinatorLayout from './layouts/CoordinatorLayout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CursosCRUD from './pages/admin/CursosCRUD';
import RegrasCurso from './pages/admin/RegrasCurso';
import CoordenadoresCRUD from './pages/admin/CoordenadoresCRUD';

// Coordinator Pages
import CoordDashboard from './pages/coordinator/CoordDashboard';
import AlunosCRUD from './pages/coordinator/AlunosCRUD';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotas de Administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="cursos" element={<CursosCRUD />} />
          <Route path="cursos/:id/regras" element={<RegrasCurso />} />
          <Route path="coordenadores" element={<CoordenadoresCRUD />} />
        </Route>

        {/* Rotas de Coordenador */}
        <Route path="/coordinator" element={<CoordinatorLayout />}>
          <Route index element={<CoordDashboard />} />
          <Route path="alunos" element={<AlunosCRUD />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
