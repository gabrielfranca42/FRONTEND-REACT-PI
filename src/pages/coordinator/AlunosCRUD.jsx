import { useState, useEffect } from 'react';
import { getAlunos, createAluno, getCursos } from '../../services/api';
import { Plus } from 'lucide-react';

export default function AlunosCRUD() {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [alunosData, cursosData] = await Promise.all([
      getAlunos(),
      getCursos()
    ]);
    setAlunos(alunosData);
    setCursos(cursosData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !matricula || !cursoId) return;
    
    await createAluno({ nome, matricula, cursoId });
    setNome('');
    setMatricula('');
    setCursoId('');
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Alunos</h1>
      </div>

      <div className="card mb-6">
        <h3 className="mb-4">Cadastrar Novo Aluno</h3>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Nome Completo</label>
            <input required type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label>Matrícula</label>
            <input required type="text" className="form-control" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 250px' }}>
            <label>Curso Vinculado</label>
            <select required className="form-control" value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
              <option value="">Selecione um curso...</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
              <Plus size={20} /> Cadastrar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-4">Alunos Matriculados</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nome do Aluno</th>
                  <th>Curso</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length === 0 ? (
                  <tr><td colSpan="3" className="text-center">Nenhum aluno cadastrado.</td></tr>
                ) : (
                  alunos.map(aluno => {
                    const curso = cursos.find(c => c.id === aluno.cursoId);
                    return (
                      <tr key={aluno.id}>
                        <td>{aluno.matricula}</td>
                        <td>{aluno.nome}</td>
                        <td>{curso ? curso.nome : 'Curso não encontrado'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
