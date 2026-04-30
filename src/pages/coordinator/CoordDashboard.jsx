import { useState, useEffect } from 'react';
import { getCertificadosPendentes, avaliarCertificado, getCursos } from '../../services/api';
import { Check, X } from 'lucide-react';

export default function CoordDashboard() {
  const [pendencias, setPendencias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [certData, cursosData] = await Promise.all([
      getCertificadosPendentes(),
      getCursos()
    ]);
    setPendencias(certData);
    setCursos(cursosData);
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

      <div className="card">
        <h3 className="mb-4">Certificados Pendentes de Avaliação</h3>
        {loading ? (
          <p>Carregando pendências...</p>
        ) : pendencias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Check size={48} style={{ margin: '0 auto', color: 'var(--secondary)' }} />
            <p className="mt-4">Tudo em dia! Nenhum certificado pendente.</p>
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
