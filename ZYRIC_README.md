# 🤖 Zyric Discord Bot - Complete Package

**Bot Name:** Zyric#4685  
**Version:** 2.0.0 (Updated)  
**Package Date:** 2025-11-13  
**Status:** ✅ Fully Configured & Ready to Deploy

---

## 📦 What's Included

This zip file contains your complete, updated Discord bot with all recent improvements.

### ✨ Latest Features

1. **Updated Stats Embed** - Clean layout matching your design
2. **1-Second Auto-End** - Instant farm completion detection
3. **New `/addstats` Command** - Admin tool for manual stat adjustments
4. **Permanent Bot Status** - DND watching "lord farms" (saved on startup)

### 📂 Package Contents

```
Zyric.zip
├── bot.js                    # Main bot logic (with all updates)
├── index.js                  # Entry point
├── embeds.js                 # Embed templates (updated stats)
├── .env                      # Your bot token configured
├── package.json              # Dependencies list
├── package-lock.json         # Locked dependency versions
├── yarn.lock                 # Yarn lock file
├── deploy-commands.js        # Slash command deployer
├── commands/
│   ├── addstats.js          # NEW: Manual stats adjustment
│   ├── farm336Commands.js   # 336 farm commands
│   ├── logCommands.js       # Log channel commands
│   ├── setearlyfarmlog.js   # Early farm log setup
│   ├── setfullfarmlog.js    # Full farm log setup
│   └── setlordbanlog.js     # Lord ban log setup
├── BOT_STATUS.md            # Bot management guide
├── UPDATE_SUMMARY.md        # Recent updates documentation
├── ADDSTATS_COMMAND_GUIDE.md # /addstats usage guide
├── START_HERE.md            # Quick start deployment
├── README.md                # General bot information
└── Other documentation files
```

**Note:** `node_modules/` excluded (reinstall with `npm install`)

---

## 🔑 Bot Token

Your bot token is already configured in the `.env` file:
```
YOUR_DISCORD_BOT_TOKEN_HERE
```

---

## 🚀 Quick Deployment

### On Any Server:

1. **Extract the zip file**
   ```bash
   unzip Zyric.zip
   cd katabump-deploy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Deploy slash commands** (first time only)
   ```bash
   node deploy-commands.js
   ```

4. **Start the bot**
   ```bash
   node index.js
   ```

### Keep Bot Running 24/7:

**Option A: Using PM2**
```bash
npm install -g pm2
pm2 start index.js --name zyric
pm2 startup
pm2 save
```

**Option B: Using Supervisor** (Linux)
```bash
sudo nano /etc/supervisor/conf.d/zyric.conf
```
Add:
```ini
[program:zyric]
command=node index.js
directory=/path/to/katabump-deploy
autostart=true
autorestart=true
```
Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start zyric
```

---

## 🎯 Bot Features

### Farm Management
- `!start` - Start 60-minute farm
- `!end` - End farm early
- `!ft` - Check remaining time
- `!stats [@user]` - View statistics
- Auto-end at 60 minutes (1-second precision)

### Moderation
- `!lordban @user <duration> <reason>` - Ban user
- `!reduceban @user <duration>` - Reduce ban
- `!history [@user]` - View ban history
- `!setuplordban` - Setup lordban system

### Role Management
- `!addhostrole @user @role` - Add host role
- `!removehostrole @user @role` - Remove host role

### Utility
- `!help` - Show help menu
- `!time` - World time zones
- `!336` - Mention farm roles
- `!status` - Update bot status (owner only)

### Slash Commands
- `/addstats` - Manually adjust user stats (Admin/Owner)
- `/sethostroles` - Configure host roles
- `/setreminderchannel` - Setup reminder channels
- `/set336roles` - Configure 336 farm roles
- `/setearlyfarmlog` - Set early farm log
- `/setfullfarmlog` - Set full farm log
- `/setlordbanlog` - Set lord ban log

---

## ⚙️ Bot Configuration

### Current Settings

**Bot Status:**
- Status: DND (Do Not Disturb) 🔴
- Activity: Watching lord farms
- Auto-applies on every startup

**Auto-End Timer:**
- Checks every 1 second
- Farms auto-end instantly at 60 minutes

**Stats Display:**
- Clean layout (no code blocks)
- Shows: Total Sessions, Total Time, Weekly Time, Weekly Sessions
- User avatar as thumbnail

---

## 📊 Admin Tools

### `/addstats` Command

Manually adjust user statistics (Admin/Owner only)

**Examples:**
```
/addstats user:@JohnDoe total_sessions:5 total_time:300
/addstats user:@Player weekly_sessions:-2
/addstats user:@Member total_time:120
```

**Options:**
- `total_sessions` - Add/subtract total sessions
- `total_time` - Add/subtract total time (minutes)
- `weekly_sessions` - Add/subtract weekly sessions
- `weekly_time` - Add/subtract weekly time (minutes)

See `ADDSTATS_COMMAND_GUIDE.md` for full documentation.

---

## 🔧 Requirements

- **Node.js:** 16.0.0 or higher
- **npm:** Latest version
- **Discord Bot Token:** Already configured
- **Internet Connection:** For Discord API

---

## 📁 Data Storage

The bot creates a `data.json` file to store:
- User statistics (sessions, time)
- Active farm sessions
- Log channel configurations
- Lord ban records
- Role configurations

**Backup Recommendation:** Regularly backup `data.json` to preserve stats.

---

## 🆘 Troubleshooting

### Bot Won't Start
```bash
node --version    # Check Node.js version (need 16+)
npm install       # Reinstall dependencies
node index.js     # Test manually
```

### Slash Commands Not Appearing
```bash
node deploy-commands.js  # Redeploy commands
```
Wait up to 1 hour for global commands to propagate.

### Bot Goes Offline
- Use PM2 or Supervisor for auto-restart
- Check server is running
- Verify token in `.env` file

---

## 📖 Documentation Files

- **BOT_STATUS.md** - Complete management guide
- **UPDATE_SUMMARY.md** - Recent updates and changes
- **ADDSTATS_COMMAND_GUIDE.md** - Admin command reference
- **START_HERE.md** - Quick deployment guide
- **README.md** - General bot information

---

## 🔐 Security Notes

- **Keep `.env` file secure** - Contains your bot token
- **Don't share your token** - Anyone with it can control your bot
- **Regenerate token if exposed** - On Discord Developer Portal
- **Backup regularly** - Keep copies of `data.json`

---

## 📝 Version History

### v2.0.0 (2025-11-13)
- ✅ Updated stats embed to clean layout
- ✅ Fixed auto-end delay (now 1-second precision)
- ✅ Added `/addstats` command for manual stat adjustments
- ✅ Set permanent bot status (DND watching lord farms)
- ✅ Improved error messages (no emojis, clean style)

### v1.0.0 (Original)
- Farm session tracking
- Lord ban system
- Role management
- Statistics tracking
- Reminder system

---

## 🎉 Ready to Deploy!

This package contains everything you need to deploy your bot on any server. Just extract, install dependencies, and run!

**Support:** Check the included documentation files for detailed guides and troubleshooting.

---

**Package Created:** 2025-11-13  
**Bot Owner:** ID 1146692880216379423  
**Bot Status:** ✅ Fully Operational
