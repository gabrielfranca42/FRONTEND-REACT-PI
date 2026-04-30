// src/services/api.js
// Fake API implementation simulating a Node.js backend using LocalStorage

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Autenticação
export const login = async (email, password) => {
  await delay(500);
  // Simulação básica de verificação de papel
  if (email.includes('admin')) {
    return { token: 'mock-jwt-token-admin', role: 'admin' };
  } else {
    return { token: 'mock-jwt-token-coord', role: 'coord' };
  }
};

// Cursos
export const getCursos = async () => {
  await delay(300);
  return getStorage('cursos');
};

export const createCurso = async (curso) => {
  await delay(300);
  const cursos = getStorage('cursos');
  const newCurso = { ...curso, id: crypto.randomUUID(), regras: [] };
  setStorage('cursos', [...cursos, newCurso]);
  return newCurso;
};

export const deleteCurso = async (id) => {
  await delay(300);
  const cursos = getStorage('cursos');
  setStorage('cursos', cursos.filter(c => c.id !== id));
};

// Regras de Cursos
export const addRegraToCurso = async (cursoId, regra) => {
  await delay(300);
  const cursos = getStorage('cursos');
  const cursoIndex = cursos.findIndex(c => c.id === cursoId);
  if (cursoIndex > -1) {
    const newRegra = { ...regra, id: crypto.randomUUID() };
    if (!cursos[cursoIndex].regras) cursos[cursoIndex].regras = [];
    cursos[cursoIndex].regras.push(newRegra);
    setStorage('cursos', cursos);
    return newRegra;
  }
  throw new Error("Curso não encontrado");
};

export const deleteRegraFromCurso = async (cursoId, regraId) => {
  await delay(300);
  const cursos = getStorage('cursos');
  const cursoIndex = cursos.findIndex(c => c.id === cursoId);
  if (cursoIndex > -1) {
    cursos[cursoIndex].regras = cursos[cursoIndex].regras.filter(r => r.id !== regraId);
    setStorage('cursos', cursos);
  }
};

// Coordenadores
export const getCoordenadores = async () => {
  await delay(300);
  return getStorage('coordenadores');
};

export const createCoordenador = async (coordenador) => {
  await delay(300);
  const coordenadores = getStorage('coordenadores');
  const newCoord = { ...coordenador, id: crypto.randomUUID() };
  setStorage('coordenadores', [...coordenadores, newCoord]);
  return newCoord;
};

// Alunos
export const getAlunos = async () => {
  await delay(300);
  return getStorage('alunos');
};

export const createAluno = async (aluno) => {
  await delay(300);
  const alunos = getStorage('alunos');
  const newAluno = { ...aluno, id: crypto.randomUUID() };
  setStorage('alunos', [...alunos, newAluno]);
  return newAluno;
};

// Certificados
export const getCertificadosPendentes = async () => {
  await delay(300);
  const certs = getStorage('certificados');
  return certs.filter(c => c.status === 'pendente');
};

export const avaliarCertificado = async (id, aprovado) => {
  await delay(300);
  const certs = getStorage('certificados');
  const index = certs.findIndex(c => c.id === id);
  if (index > -1) {
    certs[index].status = aprovado ? 'aprovado' : 'reprovado';
    setStorage('certificados', certs);
  }
};

// Dados Mockados Iniciais para facilitar o teste
export const initMockData = () => {
  if (!localStorage.getItem('cursos')) {
    const cursoId = crypto.randomUUID();
    setStorage('cursos', [{
      id: cursoId,
      nome: 'Engenharia de Software',
      cargaHorariaTotal: 300,
      regras: [
        { id: crypto.randomUUID(), categoria: 'Pesquisa', limite: 60 },
        { id: crypto.randomUUID(), categoria: 'Extensão', limite: 120 }
      ]
    }]);
    setStorage('certificados', [
      { id: crypto.randomUUID(), alunoNome: 'João Silva', cursoId, horas: 30, categoria: 'Pesquisa', status: 'pendente', descricao: 'Iniciação Científica' },
      { id: crypto.randomUUID(), alunoNome: 'Maria Souza', cursoId, horas: 10, categoria: 'Extensão', status: 'pendente', descricao: 'Semana de TI' }
    ]);
  }
};

initMockData();
