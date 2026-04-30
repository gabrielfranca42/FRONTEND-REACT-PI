import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { login } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Chamada para a API (por enquanto simulada)
      const response = await login(email, password);
      
      if (response.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/coordinator');
      }
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-2 text-center">Acesso ao Sistema</h2>
        <p className="mb-6 text-center" style={{ color: 'var(--text-muted)' }}>Faça login com suas credenciais</p>
        
        {error && <div style={{ color: 'white', backgroundColor: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>E-mail</label>
            <input 
              type="email" 
              required
              className="form-control" 
              placeholder="ex: admin@sistema.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Senha</label>
            <input 
              type="password" 
              required
              className="form-control" 
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary mt-4" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            <LogIn size={20} /> {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
        <p className="mt-4 text-center" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          * Dica: Digite "admin" no e-mail para acessar como Administrador, ou qualquer outro para Coordenador.
        </p>
      </div>
    </div>
  );
}
