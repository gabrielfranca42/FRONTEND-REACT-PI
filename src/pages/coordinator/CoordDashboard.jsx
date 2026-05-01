import { useState, useEffect } from 'react';
import { getCertificadosPendentes, avaliarCertificado, getCursos, getLoggedUser, getAlunos } from '../../services/api';
import { Check, X, Users, FileCheck, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CoordDashboard() {
  const [pendencias, setPendencias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [meusCursos, setMeusCursos] = useState([]);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const user = getLoggedUser();
    const myCourseIds = user?.courses || [];

    const [certData, cursosData, alunosData] = await Promise.all([
      getCertificadosPendentes(),
      getCursos(),
      getAlunos()
    ]);

    // Filtrar os dados apenas para os cursos do coordenador logado
    const filteredCursos = cursosData.filter(c => myCourseIds.includes(c.id));
    const filteredAlunos = alunosData.filter(a => myCourseIds.includes(a.cursoId));
    const filteredPendencias = certData.filter(cert => myCourseIds.includes(cert.cursoId));

    // Preparar dados para o gráfico de pizza
    const certsPorCategoria = filteredPendencias.reduce((acc, cert) => {
      acc[cert.categoria] = (acc[cert.categoria] || 0) + 1;
      return acc;
    }, {});
    
    const pieDataFormat = Object.keys(certsPorCategoria).map(key => ({
      name: key,
      value: certsPorCategoria[key]
    }));

    setCursos(cursosData);
    setMeusCursos(filteredCursos);
    setTotalAlunos(filteredAlunos.length);
    setPendencias(filteredPendencias);
    setPieData(pieDataFormat);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAvaliacao = async (id, aprovado) => {
    const acao = aprovado ? 'aprovar' : 'reprovar';
    if (window.confirm(`Tem certeza que deseja ${acao} este certificado?`)) {
      await avaliarCertificado(id, aprovado);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Painel do Coordenador</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seus Cursos</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              {meusCursos.length > 0 ? meusCursos.map(c => c.nome).join(', ') : 'Nenhum curso vinculado'}
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Alunos</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{totalAlunos}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--warning)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <FileCheck size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendências do Curso</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{pendencias.length}</p>
          </div>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="card mb-6">
          <h3 className="mb-4">Pendências por Categoria</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="mb-4">Certificados Pendentes de Avaliação</h3>
        {loading ? (
          <p>Carregando pendências...</p>
        ) : pendencias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Check size={48} style={{ margin: '0 auto', color: 'var(--secondary)' }} />
            <p className="mt-4">Tudo em dia! Nenhum certificado pendente no seu curso.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Curso</th>
                  <th>Categoria / Descrição</th>
                  <th>Horas Solicitadas</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendencias.map(cert => {
                  const curso = cursos.find(c => c.id === cert.cursoId);
                  return (
                    <tr key={cert.id}>
                      <td>{cert.alunoNome}</td>
                      <td>{curso ? curso.nome : 'Curso não encontrado'}</td>
                      <td>
                        <strong>{cert.categoria}</strong><br />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cert.descricao}</span>
                      </td>
                      <td>{cert.horas}h</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-secondary" 
                            style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem' }}
                            onClick={() => handleAvaliacao(cert.id, true)}
                            title="Aprovar"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.5rem' }}
                            onClick={() => handleAvaliacao(cert.id, false)}
                            title="Reprovar"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
