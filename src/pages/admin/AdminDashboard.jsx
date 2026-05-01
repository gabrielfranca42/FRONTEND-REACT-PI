import { useState, useEffect } from 'react';
import { getCursos, getCoordenadores, getAlunos, getCertificadosPendentes } from '../../services/api';
import { BookOpen, Users, GraduationCap, FileCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    cursos: 0,
    coordenadores: 0,
    alunos: 0,
    certificados: 0
  });
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
      
      <div className="card">
        <h3>Bem-vindo ao Painel do Administrador</h3>
        <p className="mt-4" style={{ color: 'var(--text-muted)' }}>
          Utilize o menu lateral para gerenciar os cursos, regras e os coordenadores do sistema. 
          As métricas acima refletem o estado atual de todo o sistema em tempo real.
        </p>
      </div>
    </div>
  );
}
