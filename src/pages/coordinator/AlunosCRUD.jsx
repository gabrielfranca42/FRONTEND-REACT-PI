import { useState, useEffect } from 'react';
import { getAlunos, createAluno, getCursos, getLoggedUser, deleteAluno, getAlunosActivities, submitActivity, adjustActivityHours } from '../../services/api';
import { Plus, Trash2, FileUp, History, X, Eye, Edit3 } from 'lucide-react';

export default function AlunosCRUD() {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para Modais
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [historico, setHistorico] = useState([]);

  // Estados para Novo Certificado (Anexo)
  const [newCert, setNewCert] = useState({
    title: '',
    category: '',
    hours: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    let activeCourseId = localStorage.getItem('activeCourseId');
    const user = getLoggedUser();

    if (!activeCourseId && user?.courses?.length > 0) {
      activeCourseId = String(user.courses[0]);
      localStorage.setItem('activeCourseId', activeCourseId);
    }

    if (!activeCourseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [alunosData, cursosData] = await Promise.all([
        getAlunos(activeCourseId),
        getCursos()
      ]);

      setAlunos(alunosData);

      // Filtrar o curso atual para exibir no formulário
      const cursoAtual = cursosData.find(c => String(c.id) === String(activeCourseId));
      if (cursoAtual) {
        setCursos([cursoAtual]);
        setCursoId(activeCourseId);
      } else {
        setCursos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCourseChanged = () => loadData();
    window.addEventListener('courseChanged', handleCourseChanged);

    return () => window.removeEventListener('courseChanged', handleCourseChanged);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeCourseId = localStorage.getItem('activeCourseId');
    if (!nome || !matricula || !activeCourseId) return;

    await createAluno({ nome, matricula, cursoId: activeCourseId });
    setNome('');
    setMatricula('');
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este aluno? Todos os certificados dele também serão afetados.')) {
      try {
        await deleteAluno(id);
        loadData();
      } catch (error) {
        alert("Erro ao excluir aluno: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const openHistory = async (aluno) => {
    setAlunoSelecionado(aluno);
    setShowHistory(true);
    try {
      const data = await getAlunosActivities(aluno.id);
      setHistorico(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const openAttach = (aluno) => {
    setAlunoSelecionado(aluno);
    setShowAttach(true);
    setNewCert({ title: '', category: '', hours: '', file: null });
  };

  const handleAttachSubmit = async (e) => {
    e.preventDefault();
    if (!newCert.file) return alert("Selecione um arquivo!");
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('studentId', alunoSelecionado.id);
      formData.append('courseId', alunoSelecionado.cursoId);
      formData.append('title', newCert.title);
      formData.append('category', newCert.category);
      formData.append('hoursClaimed', newCert.hours);
      formData.append('certificate', newCert.file);

      await submitActivity(formData);
      alert("Certificado anexado com sucesso!");
      setShowAttach(false);
      loadData();
    } catch (error) {
      alert("Erro ao anexar: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAdjustHours = async (certId) => {
    const newHours = window.prompt("Nova carga horária (apenas números):");
    if (!newHours) return;
    
    const reason = window.prompt("Justificativa para a alteração:");
    if (!reason) return alert("A justificativa é obrigatória!");

    try {
      await adjustActivityHours(certId, newHours, reason);
      alert("Horas ajustadas com sucesso!");
      // Atualizar histórico
      const data = await getAlunosActivities(alunoSelecionado.id);
      setHistorico(data);
    } catch (error) {
      alert("Erro ao ajustar horas: " + (error.response?.data?.error || error.message));
    }
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
                  <th>Ações</th>
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
                        <td>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', backgroundColor: 'var(--secondary)', color: 'white' }}
                              onClick={() => openHistory(aluno)}
                              title="Ver Histórico"
                            >
                              <History size={16} />
                            </button>
                            <button 
                              className="btn btn-info" 
                              style={{ padding: '0.4rem', backgroundColor: 'var(--primary)', color: 'white' }}
                              onClick={() => openAttach(aluno)}
                              title="Anexar Certificado"
                            >
                              <FileUp size={16} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.4rem', backgroundColor: 'var(--danger)', color: 'white' }}
                              onClick={() => handleDelete(aluno.id)}
                              title="Remover Aluno"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Histórico */}
      {showHistory && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3>Histórico de {alunoSelecionado?.nome}</h3>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Título / Descrição</th>
                    <th>Horas</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">Nenhum certificado encontrado.</td></tr>
                  ) : (
                    historico.map(h => (
                      <tr key={h.id}>
                        <td>{h.data}</td>
                        <td>{h.descricao}</td>
                        <td>{h.horas}h</td>
                        <td>
                          <span className={`badge badge-${h.status}`} style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            textTransform: 'uppercase',
                            backgroundColor: h.status === 'approved' ? '#10b981' : h.status === 'rejected' ? '#ef4444' : '#f59e0b',
                            color: 'white'
                          }}>
                            {h.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => window.open(h.certificateUrl, '_blank')} title="Ver PDF" style={{ padding: '0.3rem' }}><Eye size={16} /></button>
                            <button onClick={() => handleAdjustHours(h.id)} title="Editar Horas" style={{ padding: '0.3rem', color: 'var(--primary)' }}><Edit3 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anexo */}
      {showAttach && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="flex justify-between items-center mb-6">
              <h3>Anexar Certificado para {alunoSelecionado?.nome}</h3>
              <button onClick={() => setShowAttach(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleAttachSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Título da Atividade</label>
                <input required type="text" className="form-control" value={newCert.title} onChange={e => setNewCert({...newCert, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input required type="text" className="form-control" placeholder="Ex: Extensão, Pesquisa..." value={newCert.category} onChange={e => setNewCert({...newCert, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Carga Horária</label>
                <input required type="number" className="form-control" value={newCert.hours} onChange={e => setNewCert({...newCert, hours: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Arquivo (PDF/JPG)</label>
                <input required type="file" className="form-control" onChange={e => setNewCert({...newCert, file: e.target.files[0]})} />
              </div>
              <button type="submit" className="btn btn-primary mt-4" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Anexar Agora'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
