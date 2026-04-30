# SIGAC — Frontend

Interface web do Sistema Integrado de Gestão de Atividades Complementares (SIGAC).

## Tecnologias

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Roteamento:** React Router DOM 7
- **HTTP Client:** Axios
- **Ícones:** Lucide React
- **Estilização:** CSS puro (Vanilla CSS)

## Pré-requisitos

- Node.js 18+
- Backend rodando em `http://localhost:3000` (ver repositório do backend)

## Instalação

```bash
npm install
```

## Executar

```bash
npm run dev
```

A aplicação roda em `http://localhost:5173`

## Conexão com o Backend

O frontend se conecta ao backend via API REST. A URL base está configurada em `src/services/api.js`:

```
http://localhost:3000/api/v1
```

A autenticação usa JWT (Bearer Token) armazenado no `localStorage`.

## Funcionalidades

### Painel Administrativo (`/admin`)
- **Gestão de Cursos** — CRUD completo de cursos
- **Regras de Cursos** — Adicionar/remover categorias e limites de horas por curso
- **Gestão de Coordenadores** — Cadastro de coordenadores vinculados a cursos

### Painel do Coordenador (`/coordinator`)
- **Dashboard de Pendências** — Visualizar e avaliar certificados/atividades pendentes
- **Gestão de Alunos** — Cadastro de alunos vinculados a cursos

## Estrutura do Projeto

```
src/
├── layouts/
│   ├── AdminLayout.jsx         # Layout com sidebar do admin
│   └── CoordinatorLayout.jsx   # Layout com sidebar do coordenador
├── pages/
│   ├── Login.jsx               # Tela de login
│   ├── admin/
│   │   ├── CursosCRUD.jsx      # CRUD de cursos
│   │   ├── RegrasCurso.jsx     # Regras/categorias por curso
│   │   └── CoordenadoresCRUD.jsx # CRUD de coordenadores
│   └── coordinator/
│       ├── CoordDashboard.jsx  # Avaliação de atividades
│       └── AlunosCRUD.jsx      # CRUD de alunos
├── services/
│   └── api.js                  # Chamadas HTTP ao backend (Axios)
├── App.jsx                     # Rotas da aplicação
├── App.css
├── index.css                   # Design system / variáveis CSS
└── main.jsx                    # Ponto de entrada React
```

## Rotas

| Rota | Componente | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/admin/cursos` | CursosCRUD | Admin |
| `/admin/cursos/:id/regras` | RegrasCurso | Admin |
| `/admin/coordenadores` | CoordenadoresCRUD | Admin |
| `/coordinator` | CoordDashboard | Coordenador |
| `/coordinator/alunos` | AlunosCRUD | Coordenador |

## Backend

O backend Node.js está em um repositório separado: [PROJETO-SENAC-GERALDO](https://github.com/gabrielfranca42/PROJETO-SENAC-GERALDO)
