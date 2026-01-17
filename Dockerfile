# Stage 1: build frontend
FROM node:18 AS frontend-build
WORKDIR /app/my-app
COPY my-app/package*.json ./
RUN npm ci
COPY my-app/ .
RUN npm run build

# Stage 2: python backend
FROM python:3.11-slim
WORKDIR /app
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
RUN mkdir -p /app/static
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
# copy frontend build into backend static folder
COPY --from=frontend-build /app/my-app/dist ./static
EXPOSE 8000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]