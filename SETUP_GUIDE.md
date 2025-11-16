# 🤖 Bot Setup Guide

## 📦 Installation

1. **Extract the zip file** to your desired location

2. **Install Node.js dependencies**
   ```bash
   cd bot
   npm install
   ```

## ⚙️ Configuration

3. **Update the `.env` file** with your credentials:
   ```
   DISCORD_TOKEN=your_bot_token_here
   GUILD_ID=your_server_id_here
   ```

   **How to get these values:**
   
   - **DISCORD_TOKEN**: 
     1. Go to https://discord.com/developers/applications
     2. Select your bot application
     3. Go to "Bot" section → Reset Token → Copy it
   
   - **GUILD_ID**: 
     1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
     2. Right-click your server name → Copy Server ID

## ▶️ Running the Bot

4. **Start the bot**
   ```bash
   node bot.js
   ```

   Or use PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start bot.js --name "discord-bot"
   ```

## ✅ Bot Intents Required

Make sure these intents are enabled in Discord Developer Portal:
- ✅ Server Members Intent
- ✅ Message Content Intent
- ✅ Presence Intent

## 🎮 Commands Overview

### Farm Commands (Prefix: !)
- `!start` - Start 60-minute farm (auto-ends at 60m)
- `!end` - End farm session
- `!ft` - Check remaining farm time
- `!stats [@user]` - View farm statistics

### Moderation Commands
- `!lordban @user <duration> <reason>` - Ban user (e.g., `!lordban @user 7d spam`)
- `!reduceban @user <duration>` - Reduce ban time
- `!history [@user]` - View ban history
- `!setuplordban` - One-time setup for lordban system (Admin only)

### Role Management
- `!addhostrole @user @role` - Add host role to user (Admin only)
- `!removehostrole @user @role` - Remove host role (Admin only)

### Utility Commands
- `!336` - Ping farm roles
- `!time` - Show world time
- `!help` - Show help menu
- `!status <type> <activity> <message>` - Update bot status (Owner only)

### Slash Commands
- `/sethostroles` - Configure host roles (Admin only)
- `/setreminderchannel` - Add/remove reminder channels (Admin only)
- `/set336roles` - Configure 336 farm roles (Admin only)
- `/setearlyfarmlog` - Set early farm log channel (Admin only)
- `/setfullfarmlog` - Set full farm log channel (Admin only)
- `/setlordbanlog` - Set lord ban log channel (Admin only)

## 🔧 Recent Fixes

✅ **15-minute reminder** now shows remaining time in "Xh Ym" format (matching !ft)
✅ **Auto-end feature** - Farms automatically end after 60 minutes
✅ **Improved !stats** - Better visual design with weekly stats

## 📝 Notes

- The bot uses prefix commands (`!`) for most features
- Reminder checks run every 15 minutes
- Farm sessions auto-end at 60 minutes
- All data is stored in `data.json`

## 🆘 Support

If you encounter issues:
1. Check bot has proper permissions in your server
2. Verify all required intents are enabled
3. Make sure .env file is configured correctly
4. Check bot.log for error messages

---
**Bot Version:** 2.0.0 (Fixed & Enhanced)
