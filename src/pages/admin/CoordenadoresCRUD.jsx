import { useState, useEffect } from 'react';
import { getCoordenadores, createCoordenador, getCursos } from '../../services/api';
import { Plus } from 'lucide-react';

export default function CoordenadoresCRUD() {
  const [coordenadores, setCoordenadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [coordsData, cursosData] = await Promise.all([
      getCoordenadores(),
      getCursos()
    ]);
    setCoordenadores(coordsData);
    setCursos(cursosData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha || !cursoId) return;
    
    await createCoordenador({ nome, email, senha, cursoId });
    setNome('');
    setEmail('');
    setSenha('');
    setCursoId('');
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Coordenadores</h1>
      </div>

      <div className="card mb-6">
        <h3 className="mb-4">Novo Coordenador</h3>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Nome Completo</label>
            <input required type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>E-mail</label>
            <input required type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label>Senha</label>
            <input required type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Curso Responsável</label>
            <select required className="form-control" value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
              <option value="">Selecione um curso...</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
              <Plus size={20} /> Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-4">Coordenadores Cadastrados</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Curso Responsável</th>
                </tr>
              </thead>
              <tbody>
                {coordenadores.length === 0 ? (
                  <tr><td colSpan="3" className="text-center">Nenhum coordenador cadastrado.</td></tr>
                ) : (
                  coordenadores.map(coord => {
                    const curso = cursos.find(c => c.id === coord.cursoId);
                    return (
                      <tr key={coord.id}>
                        <td>{coord.nome}</td>
                        <td>{coord.email}</td>
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
