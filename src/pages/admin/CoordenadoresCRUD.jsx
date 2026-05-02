import { useState, useEffect } from 'react';
import { getCoordenadores, createCoordenador, updateCoordenador, deleteCoordenador, getCursos, createCurso } from '../../services/api';
import { Plus, Edit2, Trash2, XCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function CoordenadoresCRUD() {
  const [coordenadores, setCoordenadores] = useState([]);
  const [cursos, setCursos] = useState([]);

  // Estado do Formulário
  const [editingId, setEditingId] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [coordsData, cursosData] = await Promise.all([
        getCoordenadores(),
        getCursos()
      ]);
      setCoordenadores(coordsData);
      setCursos(cursosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setEmail('');
    setSenha('');
    setSelectedCourses([]);
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || (!editingId && !senha)) return;

    try {
      if (editingId) {
        await updateCoordenador(editingId, { nome, email, courses: selectedCourses });
        showMsg('Coordenador atualizado com sucesso!');
      } else {
        await createCoordenador({ nome, email, senha, courses: selectedCourses });
        showMsg('Coordenador criado com sucesso!');
      }
      resetForm();
      loadData();
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erro ao salvar coordenador', 'danger');
    }
  };

  const handleEdit = (coord) => {
    setEditingId(coord.id);
    setNome(coord.nome);
    setEmail(coord.email);
    setSenha(''); // Não editamos senha por aqui
    setSelectedCourses(coord.courses || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este coordenador? Esta ação não pode ser desfeita.')) {
      try {
        await deleteCoordenador(id);
        showMsg('Coordenador removido com sucesso!');
        loadData();
      } catch (error) {
        showMsg('Erro ao remover coordenador', 'danger');
      }
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Coordenadores</h1>
      </div>

      {message.text && (
        <div className={`card mb-4`} style={{
          backgroundColor: message.type === 'danger' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'danger' ? '#991b1b' : '#166534',
          padding: '1rem',
          border: 'none'
        }}>
          <div className="flex items-center gap-2">
            {message.type === 'danger' ? <XCircle size={20} /> : <CheckCircle size={20} />}
            {message.text}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h3 className="mb-4">{editingId ? 'Editar Coordenador' : 'Novo Coordenador'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 w-full">
          <div className="form-group" style={{ flex: '1.5', minWidth: '220px' }}>
            <label>Nome Completo</label>
            <input required type="text" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="form-group" style={{ flex: '1.2', minWidth: '200px' }}>
            <label>E-mail</label>
            <input required type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {!editingId && (
            <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
              <label>Senha</label>
              <input required type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
          )}

          {/* Seleção de Cursos Estilizada */}
          <div className="form-group" style={{ flex: '1.2', minWidth: '200px' }}>
            <label>Curso Vinculado</label>
            <select
              className="form-control"
              style={{
                borderColor: 'var(--primary)',
                boxShadow: '0 0 0 1px var(--primary)',
                cursor: 'pointer'
              }}
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedCourses.includes(val)) {
                  toggleCourse(val);
                }
              }}
            >
              <option value="">Selecione um curso...</option>
              {cursos.length > 0 && (
                <option value="all" disabled>Todos os Cursos (Apenas Filtro)</option>
              )}
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Tags de Cursos Selecionados */}
          {selectedCourses.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {selectedCourses.map(cId => {
                const curso = cursos.find(c => c.id === cId);
                return (
                  <span key={cId} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--primary)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    fontWeight: '500'
                  }}>
                    {curso ? curso.nome : '...'}
                    <button
                      type="button"
                      onClick={() => toggleCourse(cId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', height: '45px' }}>
              {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
              {editingId ? 'Salvar' : 'Criar Coordenador'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm} style={{ backgroundColor: 'var(--border)', padding: '0.6rem 1rem', fontSize: '0.9rem', height: '45px' }}>
                Cancelar
              </button>
            )}
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
                  <th>Cursos Vinculados</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {coordenadores.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">Nenhum coordenador cadastrado.</td></tr>
                ) : (
                  coordenadores.map(coord => (
                    <tr key={coord.id}>
                      <td><div style={{ fontWeight: '500' }}>{coord.nome}</div></td>
                      <td>{coord.email}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {coord.courses && coord.courses.length > 0 ? (
                            coord.courses.map(cId => {
                              const curso = cursos.find(c => c.id === cId);
                              return (
                                <span key={cId} style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                  color: 'var(--primary)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(79, 70, 229, 0.2)'
                                }}>
                                  {curso ? curso.nome : 'Desconhecido'}
                                </span>
                              );
                            })
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum curso</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', backgroundColor: '#f3f4f6', color: '#374151' }}
                            onClick={() => handleEdit(coord)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem' }}
                            onClick={() => handleDelete(coord.id)}
                            title="Excluir"
                          >
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
