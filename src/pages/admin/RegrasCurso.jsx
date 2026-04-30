import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCursos, addRegraToCurso, deleteRegraFromCurso } from '../../services/api';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

export default function RegrasCurso() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [limite, setLimite] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCurso = async () => {
    setLoading(true);
    const cursos = await getCursos();
    const found = cursos.find(c => c.id === id);
    setCurso(found);
    setLoading(false);
  };

  useEffect(() => {
    loadCurso();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoria || !limite) return;
    await addRegraToCurso(id, { categoria, limite: Number(limite) });
    setCategoria('');
    setLimite('');
    loadCurso();
  };

  const handleDelete = async (regraId) => {
    await deleteRegraFromCurso(id, regraId);
    loadCurso();
  };

  if (loading) return <p>Carregando...</p>;
  if (!curso) return <p>Curso não encontrado.</p>;

  const totalRegras = curso.regras?.reduce((acc, r) => acc + r.limite, 0) || 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/cursos" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Regras do Curso: <span style={{ color: 'var(--primary)' }}>{curso.nome}</span></h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="card" style={{ flex: 1 }}>
          <h3>Carga Horária Total</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{curso.cargaHorariaTotal}h</p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3>Total Distribuído</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: totalRegras > curso.cargaHorariaTotal ? 'var(--danger)' : 'var(--secondary)' }}>
            {totalRegras}h
          </p>
          {totalRegras > curso.cargaHorariaTotal && (
            <small style={{ color: 'var(--danger)' }}>Atenção: Limites excedem a carga total do curso!</small>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="mb-4">Nova Regra de Categoria</h3>
        <form onSubmit={handleSubmit} className="flex gap-4 items-center">
          <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nome da Categoria (ex: Pesquisa, Extensão)" 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input 
              type="number" 
              className="form-control" 
              placeholder="Limite Máx (h)" 
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} /> Adicionar
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-4">Categorias e Limites Atuais</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Limite Máximo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(!curso.regras || curso.regras.length === 0) ? (
                <tr><td colSpan="3" className="text-center">Nenhuma regra cadastrada para este curso.</td></tr>
              ) : (
                curso.regras.map(regra => (
                  <tr key={regra.id}>
                    <td>{regra.categoria}</td>
                    <td>{regra.limite}h</td>
                    <td>
                      <button onClick={() => handleDelete(regra.id)} className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                        <Trash2 size={16} /> Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
