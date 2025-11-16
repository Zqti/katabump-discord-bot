# 🤖 Discord Bot - Quick Start Guide

## ✅ WHAT'S BEEN FIXED

### 1. !addhostrole Command
**Before:** Would add Host role even if user already had it
**After:** ✅ Checks if user already has role, shows error if they do

### 2. !removehostrole Command  
**Before:** Would try to remove Host role even if user didn't have it
**After:** ✅ Checks if user has role, shows error if they don't

---

## 🚀 SETUP STEPS

### Step 1: Get Your Discord Bot Token
1. Go to: https://discord.com/developers/applications
2. Create new application or select existing one
3. Go to **Bot** section
4. Click **Reset Token** and copy it
5. **IMPORTANT:** Enable these under "Privileged Gateway Intents":
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Step 2: Configure Your Bot
```bash
cd /app/bot
nano .env
```

Replace `your_discord_bot_token_here` with your actual token:
```
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Invite Bot to Your Server
Replace `YOUR_CLIENT_ID` with your Application ID:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
```

### Step 4: Run Setup Script
```bash
cd /app/bot
./setup.sh
```

This will:
- Deploy slash commands
- Start the bot via supervisor
- Show you how to check logs

---

## 📊 MANAGING YOUR BOT

### Check Bot Status
```bash
sudo supervisorctl status bot
```

### View Live Logs
```bash
# All logs
tail -f /var/log/supervisor/bot.out.log

# Only errors
tail -f /var/log/supervisor/bot.err.log
```

### Restart Bot
```bash
sudo supervisorctl restart bot
```

### Stop Bot
```bash
sudo supervisorctl stop bot
```

### Start Bot
```bash
sudo supervisorctl start bot
```

---

## 🎮 TESTING THE FIXES

### Test !addhostrole
1. Run: `!addhostrole @username`
2. User gets Host role ✅
3. Run again: `!addhostrole @username`
4. Should show: "❌ Role Already Added - @username already has the Host role." ✅

### Test !removehostrole
1. Run: `!removehostrole @username` (on user with Host role)
2. Role is removed ✅
3. Run again: `!removehostrole @username`
4. Should show: "❌ Role Not Found - @username does not have the Host role." ✅

---

## 🔧 TROUBLESHOOTING

### Bot Not Responding?
```bash
# Check if bot is running
sudo supervisorctl status bot

# Check for errors
tail -n 50 /var/log/supervisor/bot.err.log
```

### Common Issues

**Error: "Invalid Token"**
- Double-check your token in `/app/bot/.env`
- Make sure there are no extra spaces
- Token should start with `MTIzNDU2...` or similar

**Error: "Missing Access"**
- Make sure you enabled Message Content Intent
- Re-invite bot with correct permissions

**Commands Not Working**
- Make sure you ran `./setup.sh` to deploy slash commands
- Slash commands take up to 1 hour to appear globally
- Try in a specific server for instant testing

---

## 📱 SUPPORT

Bot files are in: `/app/bot/`

Key files:
- `bot.js` - Main bot code (with fixes)
- `.env` - Your Discord token
- `setup.sh` - Setup script
- `README.md` - Full documentation

Need help? Check the logs first!
