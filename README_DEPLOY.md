Deployment notes
----------------

Files added:
- backend/requirements.txt  — Python deps
- backend/Procfile           — Heroku/Render start command
- backend/.env.example      — example env vars
- Dockerfile                — multi-stage build (frontend -> backend static)
- .dockerignore             — ignore files for Docker context
- .github/workflows/docker-publish.yml — CI: build & push Docker image

Quick next steps
1. Commit and push to GitHub.
2. In the repo settings, add secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
3. For Render/Heroku: set environment variables from `backend/.env.example`.
4. To run locally with Docker:
```bash
docker build -t sheline-app .
docker run -p 8000:8000 --env-file backend/.env sheline-app
```

If you want, I can also:
- Create a Render/Heroku deploy recipe
- Add a GitHub Action to deploy to Render after pushing the image
- Update `app.py` to serve static files from `./static` if needed

Render deployment (repo-connected service)
- Add secrets: `RENDER_API_KEY` and `RENDER_SERVICE_ID` in GitHub repo settings.
- A workflow (`.github/workflows/deploy-to-render.yml`) will POST to Render's deploy API to trigger a build of the connected service.

Heroku deployment (container-based)
- Add secrets: `HEROKU_API_KEY`, `HEROKU_APP_NAME`, and `HEROKU_EMAIL`.
- A workflow (`.github/workflows/deploy-to-heroku.yml`) will build and push the container using a Heroku deploy action.

CI notes
- The repo already contains a Docker image build workflow. The new workflows will optionally trigger deploys to Render/Heroku when those secrets are configured.
