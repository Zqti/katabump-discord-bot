# 🚀 Discord Farm Bot - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- Discord Bot Token
- Discord Server with Administrator permissions

### Installation Steps

1. **Extract the bot files**
   ```bash
   unzip discord-farm-bot.zip
   cd bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your Discord bot token
   nano .env
   ```

4. **Deploy slash commands** (Required for first-time setup)
   ```bash
   node deploy-commands.js
   ```
   
   When prompted, enter your:
   - Client ID (from Discord Developer Portal)
   - Guild ID (your Discord server ID)

5. **Start the bot**
   ```bash
   node bot.js
   # or
   npm start
   ```

## Discord Bot Setup

### Creating a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give your bot a name
4. Go to "Bot" section in the left sidebar
5. Click "Reset Token" and copy the token
6. **IMPORTANT:** Enable these Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Bot Permissions Required
The bot needs the following permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Manage Roles
- Read Message History

### Inviting the Bot

Use this URL (replace `YOUR_CLIENT_ID` with your Application ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
```

## Features Overview

### 🌾 Farm Management
- Track farm sessions with host roles
- Automatic timing (60-minute default)
- Statistics tracking
- Multi-channel support

### 🔨 Moderation
- Lord ban system with duration
- Ban reduction
- Ban history tracking
- Automated ban expiration

### 📊 Logging
- Full farm log channel
- Early end log channel
- Lord ban log channel
- All logs persist on restart

### 👑 Host Management
- Add/remove host roles
- Administrator controls
- Permission validation

### ⚙️ Bot Status Control (Owner Only)
- Change bot presence
- Set custom activities
- Support for streaming status

## Command Categories

### Farm Commands
- `!start` - Start farm session
- `!end` - End farm session
- `!ft` - Check remaining time
- `!stats [@user]` - View statistics

### Moderation Commands
- `!lordban @user <duration> <reason>`
- `!reduceban @user <duration>`
- `!history [@user]`

### Role Management (Admin Only)
- `!addhostrole @user`
- `!removehostrole @user`

### Utility Commands
- `!time` - World clocks
- `!help` - Command menu
- `!status` - Bot presence (Owner only)

### Slash Commands
- `/setfullfarmlog` - Configure full farm log
- `/setearlyfarmlog` - Configure early end log
- `/setlordbanlog` - Configure lord ban log

## Configuration

### Owner ID
The bot owner ID is set to: `1146692880216379423`

To change the owner:
1. Open `bot.js`
2. Find `const ownerId = '1146692880216379423'`
3. Replace with your Discord user ID
4. Save and restart the bot

### Lord Ban Role
Default Lord Ban role ID: `1434570143379357778`

To change:
1. Open `bot.js`
2. Search for `lordBanRoleId`
3. Update the role ID
4. Save and restart

## Data Persistence

All bot data is automatically saved to `data.json`:
- User statistics
- Active farms
- Log channel configurations
- Lord ban records
- Reminder channels

**IMPORTANT:** Make sure `data.json` is backed up regularly!

## Running in Production

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start bot.js --name "discord-farm-bot"
pm2 save
pm2 startup
```

### Using systemd (Linux)
Create `/etc/systemd/system/discord-bot.service`:
```ini
[Unit]
Description=Discord Farm Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/node bot.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable discord-bot
sudo systemctl start discord-bot
```

## Troubleshooting

### Bot won't start
- Check if Node.js version is 16.0.0 or higher
- Verify Discord token is correct in `.env`
- Ensure all dependencies are installed

### Commands not working
- Check if Message Content Intent is enabled
- Verify bot has proper permissions in server
- Check if slash commands were deployed

### Slash commands not appearing
- Run `node deploy-commands.js` again
- Wait a few minutes for Discord to update
- Kick and re-invite the bot if needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the README.md
3. Verify all setup steps were completed

## License

This bot is provided as-is for personal and server use.
