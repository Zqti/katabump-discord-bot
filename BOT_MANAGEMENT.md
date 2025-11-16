# 🤖 KataBump Bot - Management Guide

## ✅ Bot Status: RUNNING

Your Discord bot **Emo BOT** is now running successfully!

## 🎮 Bot Management Commands

### Check Bot Status
```bash
sudo supervisorctl status bot
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

### View Live Logs
```bash
# Output logs (general info)
tail -f /var/log/supervisor/bot.out.log

# Error logs
tail -f /var/log/supervisor/bot.err.log
```

## 📁 Bot File Location

**Bot files are located at:** `/home/container/bot/`

**Important files:**
- `index.js` - Main entry point
- `bot.js` - Bot logic
- `.env` - Configuration (Discord token)
- `data.json` - Bot data (created automatically)

## ⚙️ Discord Bot Commands

### Farm Commands
- `!start` - Start a 60-minute farm session (Host role required)
- `!end` - End your active farm session
- `!ft` - Check remaining farm time
- `!stats [@user]` - View farm statistics

### Moderation Commands
- `!lordban @user <duration> <reason>` - Ban a user (e.g., `!lordban @user 7d spam`)
- `!reduceban @user <duration>` - Reduce ban time
- `!history [@user]` - View ban history
- `!setuplordban` - One-time setup for lordban system (Admin only)

### Role Management (Admin Only)
- `!addhostrole @user @role` - Add host role to user
- `!removehostrole @user @role` - Remove host role

### Utility Commands
- `!336` - Ping configured farm roles for 3-3-6 farm
- `!time` - Show world time
- `!help` - Show interactive help menu
- `!status <type> <activity> <message>` - Update bot status (Owner only)

### Slash Commands (Admin)
- `/sethostroles @role1 [@role2] [@role3]` - Configure host roles
- `/setreminderchannel <action>` - Add/remove/list reminder channels
- `/set336roles @role1 [@role2] [@role3]` - Configure 336 farm roles
- `/setearlyfarmlog` - Set early farm log channel
- `/setfullfarmlog` - Set full farm log channel
- `/setlordbanlog` - Set lord ban log channel

## 🔧 Configuration

Your Discord token is stored in: `/home/container/bot/.env`

To update the token:
```bash
nano /home/container/bot/.env
# Then restart the bot
sudo supervisorctl restart bot
```

## 🆘 Troubleshooting

### Bot is offline in Discord
```bash
# Check if bot is running
sudo supervisorctl status bot

# Check error logs
tail -50 /var/log/supervisor/bot.err.log

# Restart the bot
sudo supervisorctl restart bot
```

### Bot commands not working
1. Make sure bot has proper permissions in your Discord server
2. Check if bot has the following Discord intents enabled:
   - Server Members Intent
   - Message Content Intent
3. Verify bot role is above other roles it needs to manage

### Need to redeploy slash commands
```bash
cd /home/container/bot
node deploy-commands.js
```

## 📊 Bot Features

✅ Auto-ending farms after 60 minutes
✅ 15-minute interval reminders
✅ Farm statistics tracking
✅ Lord ban system with duration
✅ Multi-channel farm support
✅ Persistent data storage
✅ Comprehensive logging

## 🔗 Useful Links

- Discord Developer Portal: https://discord.com/developers/applications
- Get your Guild ID: Enable Developer Mode → Right-click server → Copy Server ID

---

**Bot Version:** 2.0.0  
**Status:** ✅ Running  
**Logged in as:** Emo BOT#4685
