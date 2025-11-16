# How to Deploy Stats Changes to Railway

## Issue: Duplicate Commands
Your bot is deployed on **Railway**, which means:
- Railway is running the OLD code
- Local instance was creating duplicates
- You need to deploy the updated code to Railway

## Solution: Deploy to Railway

### Option 1: Push to GitHub (Recommended)
```bash
cd /app/katabump-deploy
git add .
git commit -m "Fixed stats: Red embed, bold text, hours/minutes support, add-only mode"
git push origin main
```
Railway will automatically detect the changes and redeploy.

### Option 2: Redeploy via Railway Dashboard
1. Go to your Railway dashboard
2. Find your Discord bot project
3. Click "Deploy" or "Redeploy"
4. Railway will pull the latest code and restart

### Option 3: Railway CLI
```bash
railway up
railway restart
```

## Changes Made (Ready to Deploy):
✅ Stats embed color changed to RED (#FF0000)
✅ All text is BOLD
✅ Removed Add/Subtract mode - only ADD mode
✅ Added hours & minutes support for time inputs
✅ Stats save properly after every operation
✅ Updated slash commands registered

## Files Modified:
- `/app/katabump-deploy/embeds.js`
- `/app/katabump-deploy/commands/addstats.js`
- `/app/katabump-deploy/commands/removestats.js`

## After Deploying:
Wait 2-3 minutes for Railway to:
1. Build the new code
2. Restart the bot
3. Connect to Discord

Then test with `!stats` - you should see ONE red embed with bold text!

## Important:
- DO NOT run `node index.js` locally while Railway is running
- This creates duplicate bot instances
- Only run locally if you stop the Railway deployment first
