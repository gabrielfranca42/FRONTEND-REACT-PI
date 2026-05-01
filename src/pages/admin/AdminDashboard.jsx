import { useState, useEffect } from 'react';
import { getCursos, getCoordenadores, getAlunos, getCertificadosPendentes } from '../../services/api';
import { BookOpen, Users, GraduationCap, FileCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    cursos: 0,
    coordenadores: 0,
    alunos: 0,
    certificados: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cursosData, coordData, alunosData, certData] = await Promise.all([
          getCursos(),
          getCoordenadores(),
          getAlunos(),
          getCertificadosPendentes()
        ]);
        
        setMetrics({
          cursos: cursosData.length,
          coordenadores: coordData.length,
          alunos: alunosData.length,
          certificados: certData.length
        });

        // Preparar dados para o gráfico de barras (Alunos por Curso)
        const alunosPorCurso = cursosData.map(curso => {
          const count = alunosData.filter(a => a.cursoId === curso.id).length;
          return {
            nome: curso.nome.length > 15 ? curso.nome.substring(0, 15) + '...' : curso.nome,
            Alunos: count
          };
        });
        setChartData(alunosPorCurso);

        // Preparar dados para o gráfico de pizza (Pendências por Categoria)
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
        console.error("Erro ao carregar métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando métricas globais...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Dashboard Global do Sistema</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Cursos</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{metrics.cursos}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordenadores</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{metrics.coordenadores}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <GraduationCap size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Alunos</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{metrics.alunos}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: '8px', display: 'flex' }}>
            <FileCheck size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendências</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{metrics.certificados}</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="mb-4">Alunos por Curso</h3>
          <div style={{ width: '100%', height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="nome" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="Alunos" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Pendências por Categoria</h3>
          <div style={{ width: '100%', height: 300 }}>
            {pieData.length > 0 ? (
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
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Nenhuma pendência no momento
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
