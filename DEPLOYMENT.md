# PhishLense Free Deployment Guide

This guide covers 100% free hosting options for deploying both the **PhishLense FastAPI Backend** and **Vite React Frontend**.

---

## Option 1: 1-Click Render Blueprint (Backend + Frontend Free)

Render supports Blueprint Infrastructure-as-Code to automatically launch both the Backend and Frontend with a single click.

1. Go to **[Render.com](https://dashboard.render.com/blueprints)** and sign in.
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/saideep1818/PhishLense`.
4. Render will detect [`render.yaml`](file:///c:/Users/Manda/Documents/PhishLense/render.yaml) and automatically configure:
   - `phishlense-api` (Python FastAPI Web Service)
   - `phishlense-frontend` (Vite React Static Site)
5. Click **Apply**. Both services will build and deploy on free HTTPS URLs.

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Step A: Deploy Backend on Render
1. Go to **[Render Dashboard](https://dashboard.render.com/)** $\rightarrow$ Click **New +** $\rightarrow$ **Web Service**.
2. Select repository `saideep1818/PhishLense`.
3. Fill in:
   - **Name**: `phishlense-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Click **Create Web Service**. Note your API URL (e.g. `https://phishlense-api.onrender.com`).

### Step B: Deploy Frontend on Vercel
1. Go to **[Vercel Dashboard](https://vercel.com/new)** $\rightarrow$ Import `saideep1818/PhishLense`.
2. Configure:
   - **Root Directory**: `frontend-app`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = `https://phishlense-api.onrender.com`
3. Click **Deploy**.

---

## Option 3: Hugging Face Spaces (100% Free Docker Container)

1. Go to **[Hugging Face Spaces](https://huggingface.co/new-space)**.
2. Enter Space name: `phishlense-defense-core`.
3. Select **Docker** SDK (Blank).
4. Connect or push repository code. The included [`Dockerfile`](file:///c:/Users/Manda/Documents/PhishLense/Dockerfile) will automatically build the environment with 2 vCPUs and 16 GB RAM for free.
