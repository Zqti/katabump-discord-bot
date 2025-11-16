# 🚀 Deploy KataBump Bot to Railway (24/7 Hosting)

## Why Railway?
- ✅ Free tier with $5/month credit
- ✅ Perfect for Discord bots
- ✅ Automatic restarts if bot crashes
- ✅ Easy GitHub integration
- ✅ 24/7 uptime

## 📦 Step-by-Step Deployment

### Step 1: Download Your Bot Files
Your bot files are ready at `/home/container/bot/`

**Option A: Save to GitHub (Recommended)**
1. In Emergent chat, use the "Save to GitHub" feature in the input area
2. This will push all your bot files to a GitHub repository

**Option B: Download as ZIP**
If you need the files locally, I can create a zip for you.

### Step 2: Sign Up for Railway
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 3: Deploy Your Bot
1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your KataBump bot repository
4. Railway will automatically detect it's a Node.js project

### Step 4: Add Environment Variables
1. In Railway project, go to "Variables" tab
2. Add this variable:
   ```
   DISCORD_TOKEN = YOUR_DISCORD_BOT_TOKEN_HERE
   ```
3. Click "Add" or "Save"

### Step 5: Deploy!
1. Railway will automatically build and deploy your bot
2. Check the "Deployments" tab to see status
3. Once it shows "Success" - your bot is online 24/7! 🎉

### Step 6: Verify Bot is Online
1. Go to your Discord server
2. Check if "Emo BOT" appears online
3. Test with `!help` command

## 🔄 Alternative: Deploy to Render.com

### Render Setup (Also Free)
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Set these settings:
   - **Name:** katabump-bot
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. Add environment variable: `DISCORD_TOKEN`
7. Click "Create Web Service"

## 🆘 Troubleshooting

### Bot shows offline after deployment
- Check Railway/Render logs for errors
- Verify Discord token is correct
- Make sure all environment variables are set

### Commands not working
- Run `node deploy-commands.js` locally first (one-time)
- This registers slash commands with Discord
- Or add it as a deploy script in Railway

### Bot keeps restarting
- Check logs for errors
- Verify all dependencies are in package.json
- Check if Discord token is valid

## 💰 Cost
- **Railway:** Free tier includes $5 credit/month (enough for Discord bot)
- **Render:** Free tier available for hobby projects
- Both should keep your bot online 24/7 at no cost!

## 📊 Monitoring Your Bot
Railway Dashboard shows:
- CPU and Memory usage
- Deployment logs
- Restart history
- Uptime statistics

## ✅ What's Included
Your bot package includes:
- ✅ All bot files (index.js, bot.js, commands, etc.)
- ✅ package.json with dependencies
- ✅ Procfile for deployment
- ✅ railway.json configuration
- ✅ .env template (you'll add token in Railway)

---

## 🎯 Quick Start (TL;DR)
1. Save to GitHub from Emergent
2. Sign up at railway.app
3. Deploy from GitHub repo
4. Add DISCORD_TOKEN variable
5. Bot goes live! 🚀

Need help? Check Railway's documentation or Discord server!
