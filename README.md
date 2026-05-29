# Personal Thiago Fillipo

App full stack para personal trainer gerenciar alunos, treinos, exercicios, videos, dieta, avaliacoes e progresso fisico com uma experiencia premium, minimalista e responsiva.

## Stack

- Frontend: React, Vite, JavaScript e CSS puro
- Backend: Python, FastAPI, SQLAlchemy, JWT e bcrypt
- Banco: PostgreSQL
- App instalavel: PWA com manifest, icones e service worker

## Estrutura

```txt
frontend/
  public/
    manifest.webmanifest
    sw.js
    pwa-icon-192.png
    pwa-icon-512.png
  src/components
  src/layouts
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

O Vite roda por padrao em `http://localhost:5173`.

Para testar a versao instalavel:

```bash
cd frontend
npm run build
npm run preview
```

Abra o endereco exibido pelo Vite Preview. No Chrome/Edge, use o icone de instalar app na barra do navegador ou o botao `Instalar app` na tela de login quando ele aparecer.

No celular, acesse a URL publicada com HTTPS e escolha `Adicionar a tela inicial` ou `Instalar app` no navegador.

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

A API roda em `http://localhost:8000`, com documentacao em `http://localhost:8000/docs`.

## Acessos mockados

- Personal: `thiago@personal.com` / `Personal@123`
- Aluno: `aluno@personal.com` / `Aluno@12345`
- Aluno Erika no ambiente de teste: `erikagcordeiro18@gmail.coom` / `Personal@123`

## V1 instalavel

A primeira versao instalavel ja esta preparada como PWA:

- `frontend/public/manifest.webmanifest`
- `frontend/public/sw.js`
- icones do app usando a logo oficial do leao
- metadados mobile no `index.html`
- registro do service worker no build de producao
- botao de instalacao na tela de login quando o navegador liberar o prompt

Para uma V1 publica, ainda falta hospedar com HTTPS e conectar o backend/banco em ambiente online.

## Deploy Railway

O projeto esta preparado para deploy em um unico servico Railway usando Docker:

- `Dockerfile` builda o frontend React e inicia o backend FastAPI
- FastAPI serve o `frontend/dist` em producao
- `railway.json` configura builder Docker e healthcheck em `/health`
- `DATABASE_URL` da Railway e normalizada automaticamente para `postgresql+psycopg`

Passos na Railway:

1. Crie um projeto.
2. Adicione um banco PostgreSQL.
3. Crie um servico a partir do repositorio GitHub.
4. Configure as variaveis:
   - `DATABASE_URL`: referencie a variavel do PostgreSQL da Railway
   - `SECRET_KEY`: gere uma chave forte com pelo menos 32 caracteres
   - `ENVIRONMENT`: `production`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
   - `CORS_ORIGINS`: URL publica do proprio servico Railway
5. Faça deploy pela branch `main`.

Depois do deploy, teste:

- `/health`
- `/`
- `/manifest.webmanifest`
- `/sw.js`

## Seguranca implementada

- Hash de senha com bcrypt
- JWT com expiracao
- Rotas privadas por bearer token
- Separacao entre papeis `personal` e `student`
- Personal acessa apenas seus proprios alunos
- Aluno acessa apenas seus proprios treinos e progresso
- Validacao de dados com Pydantic
- CORS configurado via `.env`
- Erros tratados sem expor detalhes sensiveis
- Segredos fora do codigo via variaveis de ambiente

## Funcionalidades

- Login
- Dashboard do personal
- Area premium do aluno
- Cadastro, listagem e edicao de alunos
- Criacao e edicao de treinos
- Cadastro de exercicios
- Videos de execucao por exercicio
- Dietas, avaliacoes e progresso
- Area do aluno para concluir exercicios e registrar carga
- Historico e graficos de progresso
- Coach IA em modo de prototipo visual

## Proximas evolucoes naturais

- Deploy com HTTPS
- Banco PostgreSQL online
- Persistencia real para dietas, avaliacoes e Coach IA
- Migracoes com Alembic
- Testes automatizados com Pytest e Playwright
- Upload seguro de fotos
- Convites por email para alunos
- Relatorios PDF mensais
- Versao APK com Capacitor depois da V1 PWA
