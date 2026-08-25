FROM node:20-bookworm AS frontend

ARG RAILWAY_GIT_COMMIT_SHA
ARG SOURCE_VERSION
ARG RAILWAY_DEPLOYMENT_ID
ENV RAILWAY_GIT_COMMIT_SHA=${RAILWAY_GIT_COMMIT_SHA}
ENV SOURCE_VERSION=${SOURCE_VERSION}
ENV RAILWAY_DEPLOYMENT_ID=${RAILWAY_DEPLOYMENT_ID}
ENV NODE_ENV=production

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
COPY start.sh ./start.sh

CMD ["sh", "-c", "python -m app.db.seed || echo '[startup] seed failed; starting API anyway'; exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

