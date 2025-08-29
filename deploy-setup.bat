@echo off
echo 🚀 SuperChase Cloud Deployment Setup
echo ======================================

REM Copy cloud-ready files
copy package-cloud.json package.json >nul
echo ✅ Updated package.json for cloud deployment

REM Initialize git if needed
if not exist .git (
    git init
    echo ✅ Initialized git repository
)

REM Add all files
git add .
git status

echo.
echo 📋 Ready for deployment!
echo.
echo Next steps:
echo 1. Create GitHub repository
echo 2. Push code: git commit -m "Cloud deployment" ^&^& git push
echo 3. Deploy on Railway: Connect GitHub repo
echo 4. Set NODE_ENV=production in Railway dashboard
echo.
echo 🔗 Railway: https://railway.app
pause