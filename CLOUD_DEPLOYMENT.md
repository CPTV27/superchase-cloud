# 🚀 SuperChase Cloud Deployment Guide

## Overview

Deploy SuperChase to **Railway** for 24/7 cloud operation with:
- ✅ **Persistent uptime** (no more rebooting crashes)
- ✅ **HTTPS/SSL** security 
- ✅ **Global CDN** for fast access
- ✅ **Automatic deployments** from code changes
- ✅ **Free tier** sufficient for most use

## Step 1: Prepare Deployment Files

**All files are ready!** The cloud-optimized system includes:
- ✅ `server.js` - Cloud-ready coordinator
- ✅ `package-cloud.json` - Cloud dependencies
- ✅ `railway.toml` - Railway configuration
- ✅ `public/index.html` - Auto-detecting web form

## Step 2: Create Railway Account

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (recommended) or email
3. **Verify** your account

## Step 3: Deploy to Railway

### Option A: GitHub Deploy (Recommended)

1. **Create GitHub repository**:
   ```bash
   # In your /system directory
   git init
   git add .
   git commit -m "SuperChase cloud deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/superchase-cloud.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Click "New Project" in Railway
   - Select "Deploy from GitHub repo"
   - Choose your SuperChase repository
   - Railway will auto-detect Node.js and deploy

### Option B: CLI Deploy (Alternative)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

## Step 4: Configure Environment

**In Railway dashboard:**

1. **Go to** your project → Variables
2. **Add environment variables**:
   ```
   NODE_ENV=production
   PORT=3000
   ```

3. **Save** and redeploy

## Step 5: Get Your Cloud URLs

**After deployment, Railway provides:**
- **App URL**: `https://superchase-cloud-production.up.railway.app`
- **API Endpoint**: `https://superchase-cloud-production.up.railway.app/api/intake`
- **Web Form**: `https://superchase-cloud-production.up.railway.app/`

## Step 6: Test Cloud Deployment

1. **Visit your app URL** in browser
2. **Submit a test task**: "Send follow-up email about project status"
3. **Verify response**: Should show Agent: claude, Confidence: 90%

## Step 7: Update Capture Scripts

**Update your local scripts to use cloud endpoint:**

**Python script** (`quick-task.py`):
```python
ENDPOINT = "https://your-app.railway.app/api/intake"
```

**Curl commands**:
```bash
curl -X POST 'https://your-app.railway.app/api/intake' \
  -H 'Content-Type: application/json' \
  -d '{"goal": "Follow up with client", "deliverables": ["email draft"]}'
```

## File Structure for Deployment

```
/system/
├── server.js              # Cloud-ready coordinator
├── package-cloud.json     # Cloud dependencies  
├── railway.toml           # Railway configuration
├── public/
│   └── index.html         # Auto-detecting web form
└── data/
    └── docs/
        └── routed/        # File storage (cloud persistent)
            ├── claude/
            ├── nova/
            ├── copilot/
            ├── logs/
            └── artifacts/
```

## Benefits of Cloud Deployment

| Local Development | Cloud Production |
|------------------|------------------|
| Stops when computer reboots | 24/7 uptime |
| `localhost:3000` only | Global HTTPS URL |
| Manual restarts needed | Auto-recovery |
| No SSL security | Full HTTPS/SSL |
| Single machine access | Access anywhere |

## Monitoring & Maintenance

**Railway Dashboard provides:**
- 📊 **Usage metrics** (requests, memory, CPU)
- 📋 **Live logs** (debug output, errors)
- 🚀 **Deployment history** (rollback if needed)
- ⚡ **Performance monitoring** (response times)

**Health Check Endpoint:**
```
GET https://your-app.railway.app/health
```

Returns system status and uptime.

## Cost & Scaling

**Railway Free Tier:**
- ✅ **$5/month credit** (usually sufficient)
- ✅ **500 hours** of usage per month
- ✅ **1GB RAM** per service
- ✅ **Multiple services** supported

**Upgrade when needed:**
- More compute for heavy usage
- Custom domains
- Team collaboration features

## Troubleshooting

**Common Issues:**

1. **Build Failed**:
   - Check `package-cloud.json` has correct dependencies
   - Ensure Node.js version >= 18

2. **App Not Starting**:
   - Verify `NODE_ENV=production` set
   - Check Railway logs for errors

3. **File Persistence**:
   - Files are stored in app instance (ephemeral)
   - For permanent storage, integrate with cloud database

4. **Environment Detection**:
   - Web form auto-detects cloud vs local
   - API endpoints adjust automatically

## Next Steps After Deployment

1. **Test all functionality** (email, calendar, analysis tasks)
2. **Update bookmarks** to cloud URL
3. **Share cloud URL** with team members
4. **Set up monitoring** alerts in Railway
5. **Integrate with Gmail/Calendar** tools for live automation

---

**Your SuperChase system will now run 24/7 in the cloud!** 🎉

**No more local server management or reboot issues.**