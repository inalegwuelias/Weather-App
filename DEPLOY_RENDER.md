# Deploy to Render (Backend) + Vercel (Frontend)

## Step 1: Deploy Backend to Render

### 1.1 Go to Render.com
- Sign up/login at https://render.com
- Click **"New +"** → **"Web Service"**

### 1.2 Connect GitHub Repo
- Select your `Weather-App` repository
- Click **Connect**

### 1.3 Configure Web Service

| Setting | Value |
|---------|-------|
| **Name** | weather-app-backend |
| **Region** | Ohio (US East) or closest to you |
| **Branch** | main |
| **Root Directory** | `Weather App/weather-app` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run server` |
| **Plan** | Free |

### 1.4 Add Environment Variables
Click **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `WEATHER_API_KEY` | `eb6e9285f1a6990ef4c0ba66f8b665fd` |
| `PORT` | `10000` (Render sets this automatically) |

### 1.5 Create Web Service
Click **Create Web Service**

Wait 2-3 minutes for deployment. You'll get a URL like:
`https://weather-app-backend-abc123.onrender.com`

---

## Step 2: Update Vercel Config

Once you have your Render URL, update `vercel.json`:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://weather-app-backend-abc123.onrender.com/api/$1"
    }
  ]
}
```

Replace `weather-app-backend-abc123.onrender.com` with your actual Render URL.

---

## Step 3: Deploy Frontend to Vercel

### Option A: GitHub Integration (Easiest)
1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Weather App/weather-app`
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable: `WEATHER_API_KEY` = your API key
6. Click **Deploy**

### Option B: Vercel CLI
```bash
npm i -g vercel

cd "Weather App/weather-app"

vercel
# Follow prompts, set:
# - Root: Weather App/weather-app
# - Framework: Vite
```

---

## Step 4: Verify Deployment

### Test Backend
Open browser:
```
https://your-backend.onrender.com/api/health
```
Should return: `{"status":"ok","mode":"LIVE"}`

### Test Frontend
Open your Vercel URL and try searching for a city.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend shows "DEMO mode" | Check `WEATHER_API_KEY` env var in Render |
| Frontend can't connect | Verify `vercel.json` rewrite URL matches Render URL |
| CORS errors | Ensure CORS is enabled in `server/index.js` |

---

## Your URLs Will Be:
- **Frontend**: `https://weather-app-yourname.vercel.app`
- **Backend**: `https://weather-app-backend-xxx.onrender.com`
