import { useState, useEffect } from 'react';
import { getCertificadosPendentes, avaliarCertificado, getCursos, getCourseStats } from '../../services/api';
import { Check, X, Users, FileCheck, BookOpen, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CoordDashboard() {
  const [pendencias, setPendencias] = useState([]);
  const [cursoAtivo, setCursoAtivo] = useState(null);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    pendentes: 0,
    aprovadas: 0,
    rejeitadas: 0,
    totalHorasAprovadas: 0
  });
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const activeCourseId = localStorage.getItem('activeCourseId');
    if (!activeCourseId) return;

    setLoading(true);
    try {
      const [certData, cursosData, statsData] = await Promise.all([
        getCertificadosPendentes(activeCourseId),
        getCursos(),
        getCourseStats(activeCourseId)
      ]);

      const curso = cursosData.find(c => c.id === activeCourseId);
      setCursoAtivo(curso);
      setStats(statsData);
      setPendencias(certData);

      // Preparar dados para o gráfico de pizza (baseado nas pendências atuais)
      const certsPorCategoria = certData.reduce((acc, cert) => {
        acc[cert.categoria] = (acc[cert.categoria] || 0) + 1;
        return acc;
      }, {});
      
      const pieDataFormat = Object.keys(certsPorCategoria).map(key => ({
        name: key,
        value: certsPorCategoria[key]
      }));
      setPieData(pieDataFormat);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Ouvir mudanças de curso vindas do Layout
    const handleCourseChanged = () => loadData();
    window.addEventListener('courseChanged', handleCourseChanged);
    
    return () => window.removeEventListener('courseChanged', handleCourseChanged);
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
        <h1>Painel do Coordenador {cursoAtivo && <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>| {cursoAtivo.nome}</span>}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Alunos</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalAlunos}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--warning)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <Clock size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendentes</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.pendentes}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <Check size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aprovadas</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.aprovadas}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <FileCheck size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Horas</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalHorasAprovadas}h</p>
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
