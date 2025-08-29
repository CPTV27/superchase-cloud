#!/bin/bash

echo "🚀 SuperChase Cloud Deployment Setup"
echo "======================================"

# Copy cloud-ready files
cp package-cloud.json package.json
echo "✅ Updated package.json for cloud deployment"

# Initialize git if needed
if [ ! -d .git ]; then
    git init
    echo "✅ Initialized git repository"
fi

# Add all files
git add .
git status

echo ""
echo "📋 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository"
echo "2. Push code: git commit -m 'Cloud deployment' && git push"
echo "3. Deploy on Railway: Connect GitHub repo"
echo "4. Set NODE_ENV=production in Railway dashboard"
echo ""
echo "🔗 Railway: https://railway.app"