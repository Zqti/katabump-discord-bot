# 🚀 KataBump Bot - Deployment to katabump.com

## 📦 What's Included

This package contains your complete KataBump Discord bot ready for deployment:

```
katabump-bot/
├── index.js              # Main entry point
├── bot.js                # Core bot logic (1,283 lines)
├── embeds.js             # Message embeds
├── deploy-commands.js    # Slash command registration
├── commands/             # Command modules
│   ├── farm336Commands.js
│   ├── logCommands.js
│   ├── setearlyfarmlog.js
│   ├── setfullfarmlog.js
│   └── setlordbanlog.js
├── package.json          # Dependencies
├── .env                  # Configuration (includes your token)
└── setup.sh              # Quick setup script
```

---

## 🖥️ Deployment Methods for katabump.com

### Method 1: VPS/Server with SSH Access (Recommended)

#### Step 1: Upload Files
```bash
# From your local machine (if you downloaded the zip):
scp -r katabump-bot/* user@katabump.com:/var/www/katabump-bot/

# Or use SFTP/FileZilla
```

#### Step 2: SSH into Your Server
```bash
ssh user@katabump.com
cd /var/www/katabump-bot
```

#### Step 3: Install Node.js (if not installed)
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 4: Install Dependencies
```bash
npm install
```

#### Step 5: Test the Bot
```bash
# Quick test (will run for a few seconds)
node index.js

# You should see:
# ✅ Logged in as Emo BOT#4685
```

#### Step 6: Keep Bot Running 24/7 with PM2
```bash
# Install PM2
sudo npm install -g pm2

# Start bot
pm2 start index.js --name katabump-bot

# Make it auto-start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs katabump-bot
```

---

### Method 2: cPanel/Plesk Hosting

#### Step 1: Upload via File Manager
1. Log into your cPanel at katabump.com/cpanel
2. Go to File Manager
3. Create folder: `/home/username/katabump-bot`
4. Upload the zip file
5. Extract all files

#### Step 2: Setup Node.js Application
1. In cPanel, find "Setup Node.js App"
2. Click "Create Application"
3. Configure:
   - **Node.js version:** 16.x or higher
   - **Application mode:** Production
   - **Application root:** `/home/username/katabump-bot`
   - **Application URL:** Not needed (bot doesn't serve web pages)
   - **Application startup file:** `index.js`
4. Click "Create"

#### Step 3: Install Dependencies
1. In the Node.js App interface, click "Run NPM Install"
2. Or use Terminal: `npm install`

#### Step 4: Start the Bot
1. Click "Start Application"
2. Check logs for confirmation

---

### Method 3: Pterodactyl Panel

If katabump.com uses Pterodactyl game panel:

#### Step 1: Upload Files
1. Access your panel at katabump.com
2. Go to File Manager
3. Upload all files to `/home/container/`

#### Step 2: Configure Startup
1. Go to "Startup" tab
2. Set startup command: `node index.js`
3. Set working directory: `/home/container/`

#### Step 3: Start Server
1. Go to "Console" tab
2. Click "Start"
3. Bot should connect to Discord

---

## ⚙️ Configuration

### Discord Token
Your token is already configured in `.env`:
```
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
```

### Guild ID (Optional)
If you want to restrict bot to specific server:
1. Enable Developer Mode in Discord
2. Right-click your server → Copy Server ID
3. Edit `.env` and add: `GUILD_ID=your_server_id`

---

## 🔧 Post-Deployment Setup

### 1. Deploy Slash Commands (One-time)
```bash
node deploy-commands.js
```
This registers slash commands with Discord.

### 2. Verify Bot is Online
1. Go to your Discord server
2. Check "Emo BOT" is online (green status)
3. Test with `!help` command

### 3. Configure Bot Settings (Optional)
In your Discord server, use these admin commands:
```
/sethostroles @role1 @role2     # Set host roles
/set336roles @role1 @role2       # Set farm roles
/setfullfarmlog                  # Set log channel
```

---

## 📊 Bot Management Commands

### PM2 Management (if using PM2)
```bash
pm2 status                  # Check bot status
pm2 restart katabump-bot    # Restart bot
pm2 stop katabump-bot       # Stop bot
pm2 logs katabump-bot       # View logs
pm2 monit                   # Monitor resources
```

### Manual Start/Stop
```bash
# Start
node index.js

# Stop
# Press Ctrl+C
```

---

## 🎮 Available Discord Commands

### Farm Management
- `!start` - Start 60-minute farm (Host role required)
- `!end` - End farm session
- `!ft` - Check remaining farm time
- `!stats [@user]` - View statistics

### Moderation
- `!lordban @user <duration> <reason>` - Ban user
- `!reduceban @user <duration>` - Reduce ban
- `!history [@user]` - View ban history
- `!setuplordban` - Initial setup (Admin, one-time)

### Utility
- `!336` - Ping farm roles
- `!time` - World time
- `!help` - Interactive help menu
- `!status` - Change bot status (Owner only)

### Admin Commands
- `!addhostrole @user @role` - Add host role
- `!removehostrole @user @role` - Remove host role

---

## 🆘 Troubleshooting

### Bot Won't Start
```bash
# Check Node.js version (need 16+)
node --version

# Check for errors
node index.js

# Check if dependencies installed
ls node_modules/
```

### Bot Goes Offline
- Check server/hosting is running
- Verify PM2 is running: `pm2 status`
- Check logs: `pm2 logs katabump-bot`
- Verify Discord token is valid

### Commands Not Working
1. Check bot has proper Discord permissions
2. Enable these intents in Discord Developer Portal:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
3. Redeploy slash commands: `node deploy-commands.js`

### Memory Issues
```bash
# Check memory usage
pm2 monit

# Increase memory limit (if needed)
pm2 delete katabump-bot
pm2 start index.js --name katabump-bot --max-memory-restart 300M
```

---

## 🔒 Security Notes

1. **Keep .env secure** - Never share your Discord token
2. **Regular backups** - Backup `data.json` (contains bot data)
3. **Update dependencies** - Run `npm update` periodically
4. **Monitor logs** - Check for suspicious activity

---

## 📈 What This Bot Does

✅ Farm session management (auto-ends at 60 min)
✅ 15-minute interval reminders
✅ User statistics tracking
✅ Lord ban system with duration
✅ Multi-channel support
✅ Role management
✅ Comprehensive logging
✅ Persistent data storage

---

## 💡 Quick Start Commands

```bash
# Upload to server
scp -r katabump-bot user@katabump.com:/var/www/

# SSH in
ssh user@katabump.com
cd /var/www/katabump-bot

# Install and start
npm install
pm2 start index.js --name katabump-bot
pm2 save

# Deploy slash commands
node deploy-commands.js

# Done! Bot is live 24/7 🎉
```

---

## 📞 Support

- Check logs first: `pm2 logs katabump-bot`
- Verify all files uploaded correctly
- Ensure Node.js 16+ is installed
- Confirm Discord token is valid
- Check bot permissions in Discord server

**Bot Status:** Ready for deployment to katabump.com! 🚀
