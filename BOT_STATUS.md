# 🤖 KataBump Discord Bot - Status & Management

## ✅ Current Status

**Bot Status:** 🟢 ONLINE AND RUNNING
**Bot Name:** Zyric#4685
**Process:** Managed by Supervisor
**Auto-start:** ✅ Enabled (will restart automatically if server reboots)

---

## 🎯 Bot Token Configuration

Your bot token has been set in `/app/katabump-deploy/.env`:
```
YOUR_DISCORD_BOT_TOKEN_HERE
```

---

## 🔧 Management Commands

### Check Bot Status
```bash
sudo supervisorctl status discordbot
```

### View Live Logs
```bash
# View output logs
tail -f /var/log/supervisor/discordbot.out.log

# View error logs
tail -f /var/log/supervisor/discordbot.err.log
```

### Control the Bot
```bash
# Stop the bot
sudo supervisorctl stop discordbot

# Start the bot
sudo supervisorctl start discordbot

# Restart the bot
sudo supervisorctl restart discordbot
```

### Update Bot Code
If you make changes to the bot files:
```bash
cd /app/katabump-deploy
# Make your changes, then:
sudo supervisorctl restart discordbot
```

---

## 📋 Bot Features

### Farm Commands
- `!start` - Start a 60-minute farm session
- `!end` - End your active farm session
- `!ft` - Check remaining farm time
- `!stats [@user]` - View farm statistics

### Moderation
- `!lordban @user <duration> <reason>` - Ban a user
- `!reduceban @user <duration>` - Reduce ban time
- `!history [@user]` - View ban history
- `!setuplordban` - Setup lordban system (Admin only)

### Role Management
- `!addhostrole @user @role` - Give host role
- `!removehostrole @user @role` - Remove host role

### Utility
- `!time` - Show current time in major cities
- `!help` - Show help menu
- `!336` - Mention farm roles for 3-3-6 farm
- `!status <type> <activity> <message>` - Update bot status (Owner only)

### Slash Commands
- `/sethostroles` - Configure host roles
- `/setreminderchannel` - Add/remove reminder channels
- `/set336roles` - Configure 336 farm roles
- `/setearlyfarmlog` - Set early farm end log channel
- `/setfullfarmlog` - Set full farm log channel
- `/setlordbanlog` - Set lord ban log channel

---

## 🚀 Auto-Start Configuration

The bot is configured to:
- ✅ Start automatically when the server boots
- ✅ Restart automatically if it crashes
- ✅ Run in the background using Supervisor

Supervisor configuration: `/etc/supervisor/conf.d/discordbot.conf`

---

## 📁 Bot Files Location

All bot files are in: `/app/katabump-deploy/`
- `bot.js` - Main bot logic
- `index.js` - Entry point
- `.env` - Configuration (bot token)
- `commands/` - Slash command handlers
- `embeds.js` - Embed templates
- `data.json` - Bot data storage (auto-created)

---

## ✨ What Happens When Server Restarts?

When you wake up the server or it restarts:
1. Supervisor automatically starts
2. Discord bot automatically launches
3. Bot reconnects to Discord
4. All data is preserved in `data.json`

**You don't need to do anything - it's fully automated!** 🎉

---

## 🆘 Troubleshooting

### Bot not responding in Discord?
1. Check if bot is running: `sudo supervisorctl status discordbot`
2. Check logs: `tail -n 50 /var/log/supervisor/discordbot.out.log`
3. Restart: `sudo supervisorctl restart discordbot`

### Bot offline after server restart?
- This shouldn't happen with Supervisor auto-start
- If it does, run: `sudo supervisorctl start discordbot`

### Need to change bot token?
1. Edit: `nano /app/katabump-deploy/.env`
2. Update DISCORD_TOKEN value
3. Restart: `sudo supervisorctl restart discordbot`

---

## 📊 Current Configuration

- **Reminder channels:** 0 (use `/setreminderchannel` to add)
- **336 farm roles:** 0 (use `/set336roles` to configure)
- **Host roles:** 0 (use `/sethostroles` to configure)

To set these up in Discord:
1. Use the slash commands above (they require Admin permissions)
2. Bot will save the configuration automatically

---

**Last Updated:** 2025-11-12
**Bot Version:** 2.0.0
**Status:** ✅ Fully Operational
