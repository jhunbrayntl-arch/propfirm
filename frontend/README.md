## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/propfirm-platform#frontend)

### Quick Deploy Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from frontend folder
cd frontend
netlify init
netlify deploy --prod
```

### Environment Variables Required

Set these in Netlify Dashboard:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### Backend Deployment

Deploy backend separately to Render/Railway:
- **Render**: https://render.com
- **Railway**: https://railway.app

See NETLIFY_DEPLOY.md for complete instructions.
