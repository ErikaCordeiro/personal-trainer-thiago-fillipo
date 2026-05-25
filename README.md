# Personal Thiago Fillipo

App full stack para personal trainer gerenciar alunos, treinos, exercícios, vídeos e progresso físico com uma experiência premium, minimalista e responsiva.

## Stack

- Frontend: React, Vite, JavaScript e CSS puro
- Backend: Python, FastAPI, SQLAlchemy, JWT e bcrypt
- Banco: PostgreSQL

## Estrutura

```txt
frontend/
  src/components
  src/pages
  src/data
  src/services
  src/styles
backend/
  app/api/routes
  app/core
  app/db
  app/models
  app/schemas
  app/services
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

O Vite roda por padrão em `http://localhost:5173`.

## Backend

Crie o banco PostgreSQL:

```sql
CREATE DATABASE personal_thiago_fillipo;
```

Configure o ambiente:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Atualize `DATABASE_URL` e `SECRET_KEY` no `.env`. Depois inicialize dados mockados:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

A API roda em `http://localhost:8000`, com documentação em `http://localhost:8000/docs`.

## Acessos mockados

- Personal: `thiago@personal.com` / `Personal@123`
- Aluno: `aluno@personal.com` / `Aluno@12345`

## Segurança implementada

- Hash de senha com bcrypt
- JWT com expiração
- Rotas privadas por bearer token
- Separação entre papéis `personal` e `student`
- Personal acessa apenas seus próprios alunos
- Aluno acessa apenas seus próprios treinos e progresso
- Validação de dados com Pydantic
- CORS configurado via `.env`
- Erros tratados sem expor detalhes sensíveis
- Segredos fora do código via variáveis de ambiente

## Funcionalidades

- Login
- Dashboard do personal
- Cadastro, listagem e edição de alunos
- Criação e edição de treinos
- Cadastro de exercícios
- Vídeos de execução por exercício
- Área do aluno para concluir exercícios e registrar carga
- Histórico e gráficos de progresso

## Próximas evoluções naturais

- Migrações com Alembic
- Testes automatizados com Pytest e Playwright
- Upload seguro de fotos
- Convites por email para alunos
- Relatórios PDF mensais
- Deploy com HTTPS, proxy reverso e observabilidade
