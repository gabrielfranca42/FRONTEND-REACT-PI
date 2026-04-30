import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCursos, createCurso, deleteCurso } from '../../services/api';
import { Trash2, Settings, Plus } from 'lucide-react';

export default function CursosCRUD() {
  const [cursos, setCursos] = useState([]);
  const [nome, setNome] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCursos = async () => {
    setLoading(true);
    const data = await getCursos();
    setCursos(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCursos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !cargaHoraria) return;
    await createCurso({ nome, cargaHorariaTotal: Number(cargaHoraria) });
    setNome('');
    setCargaHoraria('');
    loadCursos();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      await deleteCurso(id);
      loadCursos();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Cursos</h1>
      </div>

      <div className="card mb-6">
        <h3 className="mb-4">Novo Curso</h3>
        <form onSubmit={handleSubmit} className="flex gap-4 items-center">
          <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nome do Curso" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input 
              type="number" 
              className="form-control" 
              placeholder="Carga Horária (h)" 
              value={cargaHoraria}
              onChange={(e) => setCargaHoraria(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} /> Adicionar
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-4">Cursos Cadastrados</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome do Curso</th>
                  <th>Carga Horária Total</th>
                  <th>Regras</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cursos.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">Nenhum curso cadastrado.</td></tr>
                ) : (
                  cursos.map(curso => (
                    <tr key={curso.id}>
                      <td>{curso.nome}</td>
                      <td>{curso.cargaHorariaTotal}h</td>
                      <td>{curso.regras?.length || 0} regras</td>
                      <td>
                        <div className="flex gap-2">
                          <Link to={`/admin/cursos/${curso.id}/regras`} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            <Settings size={16} /> Regras
                          </Link>
                          <button onClick={() => handleDelete(curso.id)} className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
