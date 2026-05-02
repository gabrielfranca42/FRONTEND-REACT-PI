// src/services/api.js
// API real conectada ao backend Node.js em http://localhost:3000/api/v1

import axios from 'axios';

// =========================================================================
// CONFIGURAÇÃO BASE DO AXIOS
// =========================================================================
const api = axios.create({
  baseURL: 'https://projeto-senac-geraldo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Redireciona para login se token expirou
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Só redireciona se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// =========================================================================
// AUTENTICAÇÃO
// =========================================================================

/**
 * Login — retorna { token, user: { id, name, email, role, courses } }
 * O frontend espera { token, role }
 */
export const login = async (email, password) => {


  const { data } = await api.post('/auth/login', { email, password });
  
  // Salvar token e dados do usuário no localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Mapear role do backend para o formato do frontend
  const roleMap = {
    'SUPER_ADMIN': 'admin',
    'ADMIN': 'admin',
    'COORDINATOR': 'coord',
    'STUDENT': 'student'
  };
  
  return { 
    token: data.token, 
    role: roleMap[data.user.role] || 'coord',
    user: data.user
  };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getLoggedUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// =========================================================================
// CURSOS (Mapeamento: Frontend PT-BR ↔ Backend EN)
// =========================================================================

// Converte curso do backend (EN) para formato do frontend (PT-BR)
const mapCursoFromBackend = (course) => ({
  id: course._id,
  nome: course.name,
  cargaHorariaTotal: course.totalHoursRequired,
  regras: (course.categories || []).map(cat => ({
    id: cat._id,
    categoria: cat.name,
    limite: cat.maxHours
  }))
});

/**
 * GET /api/v1/courses → lista de cursos
 */
export const getCursos = async () => {
  const { data } = await api.get('/courses');
  return data.map(mapCursoFromBackend);
};

/**
 * POST /api/v1/courses → cria curso
 * Frontend envia: { nome, cargaHorariaTotal }
 */
export const createCurso = async (curso) => {
  const { data } = await api.post('/courses', {
    name: curso.nome,
    totalHoursRequired: Number(curso.cargaHorariaTotal)
  });
  return mapCursoFromBackend(data);
};

/**
 * DELETE /api/v1/courses/:id → exclui curso
 */
export const deleteCurso = async (id) => {
  await api.delete(`/courses/${id}`);
};

// =========================================================================
// REGRAS DE CURSOS (Categorias)
// =========================================================================

/**
 * POST /api/v1/courses/:cursoId/categories → adiciona regra
 * Frontend envia: { categoria, limite }
 */
export const addRegraToCurso = async (cursoId, regra) => {
  const { data } = await api.post(`/courses/${cursoId}/categories`, {
    name: regra.categoria,
    maxHours: Number(regra.limite),
    semesterMaxHours: 0
  });
  return {
    id: data._id,
    categoria: data.name,
    limite: data.maxHours
  };
};

/**
 * DELETE /api/v1/courses/:cursoId/categories/:regraId → remove regra
 */
export const deleteRegraFromCurso = async (cursoId, regraId) => {
  await api.delete(`/courses/${cursoId}/categories/${regraId}`);
};

// =========================================================================
// COORDENADORES (Users com role COORDINATOR)
// =========================================================================

/**
 * GET /api/v1/users?role=COORDINATOR → lista coordenadores
 */
export const getCoordenadores = async () => {
  const { data } = await api.get('/users', { params: { role: 'COORDINATOR' } });
  return data.map(user => ({
    id: user._id,
    nome: user.name,
    email: user.email,
    cursoId: user.courses?.[0] || null
  }));
};

/**
 * POST /api/v1/users/register → cadastra coordenador
 * Frontend envia: { nome, email, senha, cursoId }
 */
export const createCoordenador = async (coordenador) => {
  const { data } = await api.post('/users/register', {
    name: coordenador.nome,
    email: coordenador.email,
    password: coordenador.senha,
    role: 'COORDINATOR',
    courses: [coordenador.cursoId]
  });
  return {
    id: data.user.id,
    nome: data.user.name,
    email: data.user.email,
    cursoId: data.user.courses?.[0] || null
  };
};

// =========================================================================
// ALUNOS (Users com role STUDENT)
// =========================================================================

/**
 * GET /api/v1/users?role=STUDENT → lista alunos
 */
export const getAlunos = async () => {
  const { data } = await api.get('/users', { params: { role: 'STUDENT' } });
  return data.map(user => ({
    id: user._id,
    nome: user.name,
    matricula: user.matricula || '',
    cursoId: user.courses?.[0] || null
  }));
};

/**
 * POST /api/v1/users/register → cadastra aluno
 * Frontend envia: { nome, matricula, cursoId }
 */
export const createAluno = async (aluno) => {
  const { data } = await api.post('/users/register', {
    name: aluno.nome,
    email: `${aluno.matricula}@aluno.senac.br`, // E-mail gerado a partir da matrícula
    password: aluno.matricula, // Senha padrão = matrícula (aluno deve trocar depois)
    role: 'STUDENT',
    matricula: aluno.matricula,
    courses: [aluno.cursoId]
  });
  return {
    id: data.user.id,
    nome: data.user.name,
    matricula: data.user.matricula,
    cursoId: data.user.courses?.[0] || null
  };
};

// =========================================================================
// CERTIFICADOS / ATIVIDADES
// =========================================================================

/**
 * GET /api/v1/activities?status=PENDING → certificados pendentes
 */
export const getCertificadosPendentes = async () => {
  const { data } = await api.get('/activities', { params: { status: 'PENDING' } });
  return data.map(act => ({
    id: act._id,
    alunoNome: act.student?.name || 'Desconhecido',
    cursoId: act.course?._id || act.course,
    horas: act.hoursClaimed,
    categoria: act.category,
    status: act.status.toLowerCase(),
    descricao: act.title
  }));
};

/**
 * PUT /api/v1/activities/:id/evaluate → aprovar ou reprovar
 */
export const avaliarCertificado = async (id, aprovado) => {
  await api.put(`/activities/${id}/evaluate`, {
    status: aprovado ? 'APPROVED' : 'REJECTED'
  });
};
