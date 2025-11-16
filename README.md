# Discord Farm Bot

## ✅ FIXES APPLIED & NEW FEATURES

### Fixed Issues:
1. **!addhostrole** - Now checks if user already has Host role before adding
2. **!removehostrole** - Now checks if user has Host role before removing
3. **!start command** - Fixed to check all channels for active farms (not just one channel or per-user)

### New Features:
4. **!336 command** ✨ - Ping configured farm roles for 3-3-6 farm (Host/Staff/Admin access)
5. **!status command** ✨ - Bot owner can now change bot presence (online/idle/dnd/invisible) and activities (playing/watching/listening/streaming)
6. **4 New Slash Commands** ✨:
   - `/setlordban` - Ban/unban users from Lord access
   - `/sethostroles` - Configure host roles
   - `/setreminderchannel` - Manage reminder channels
   - `/set336roles` - Set roles for 3-3-6 farm pings
7. **Enhanced Data Persistence** - All new settings save automatically and persist through bot restarts

## Setup Instructions

### 1. Get Your Discord Bot Token
1. Go to https://discord.com/developers/applications
2. Create a new application or select existing one
3. Go to "Bot" section
4. Click "Reset Token" and copy the token
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent

### 2. Configure Bot
```bash
cd /app/bot
cp .env.example .env
# Edit .env and add your Discord token
```

### 3. Invite Bot to Your Server
Use this URL (replace CLIENT_ID with your application ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
```

### 4. Deploy Slash Commands
```bash
cd /app/bot
node deploy-commands.js
```

### 5. Start Bot
```bash
cd /app/bot
node bot.js
```

## Available Commands

### Prefix Commands (using !)
- `!start` - Start a 60-minute farm session (Host only)
- `!end` - End active farm session
- `!ft` - Check remaining farm time
- `!stats [@user]` - Show farm statistics
- `!help` - Show all commands
- `!time` - Show world times
- `!336` - Ping farm roles for 3-3-6 farm (Host/Staff/Admin) ✨ NEW
- `!status <type> <activity> <message>` - Update bot status (Bot Owner only) ✨ NEW
- `!lordban @user duration reason` - Ban a user
- `!reduceban @user duration` - Reduce ban time
- `!history [@user]` - Show ban history
- `!addhostrole @user` - Add Host role (Admin only) ✅ FIXED
- `!removehostrole @user` - Remove Host role (Admin only) ✅ FIXED

### Slash Commands
- `/setfullfarmlog` - Set full farm log channel
- `/setearlyfarmlog` - Set early end log channel
- `/setlordbanlog` - Set lord ban log channel
- `/setlordban @user` - Ban/unban user from Lord access ✨ NEW
- `/sethostroles @role1 [@role2] [@role3]` - Set host roles ✨ NEW
- `/setreminderchannel <action>` - Add/remove/list reminder channels ✨ NEW
- `/set336roles @role1 [@role2] [@role3]` - Set roles for 3-3-6 farm ✨ NEW
- `/addstats @user <mode> [stats]` - Edit user farm statistics (Admin only) ✨ NEW
- `/removestats @user <action>` - Remove/reset user statistics (Admin only) ✨ NEW

## Status Command Usage ✨

The `!status` command allows the bot owner to change the bot's presence and activity.

### Syntax
```
!status <type> <activity> <message> [url]
```

### Status Types
- `online` - Green status (available)
- `idle` - Yellow status (away)
- `dnd` - Red status (do not disturb)
- `invisible` - Invisible status

### Activity Types
- `playing` - Shows "Playing <game>"
- `watching` - Shows "Watching <something>"
- `listening` - Shows "Listening to <music>"
- `streaming` - Shows "Streaming" (requires Twitch/YouTube URL)

### Examples
```
!status online playing "Minecraft"
!status dnd watching "YouTube Videos"
!status idle listening "Spotify Playlist"
!status streaming streaming "Live Gaming" https://twitch.tv/username
!status online
```

## 3-3-6 Farm System ✨

The bot now includes a dedicated system for managing 3-3-6 farm role pings.

### Setup
1. **Configure farm roles** using `/set336roles @role1 [@role2] [@role3]`
   - Set up to 3 roles that should be pinged for 3-3-6 farms
   
2. **Use the !336 command** to ping all configured roles
   - Only Host, Staff, Admin, or Bot Owner can use this command
   - Automatically mentions all configured roles with farm message

### Usage Example
```
Administrator: /set336roles @Tank @Healer @DPS
Host: !336
Bot: @Tank @Healer @DPS
     Need all roles for 3-3-6 farm. CANNOT FULLY AFK.
```

### Additional 336 Features
- `/setlordban @user` - Manage Lord access bans
- `/sethostroles` - Configure which roles count as hosts
- `/setreminderchannel` - Set up automatic farm reminders
- All settings persist through bot restarts

## Stats Management Commands ✨

The bot now includes powerful admin-only commands to manage user statistics.

### `/addstats` - Edit User Statistics
Modify user farm stats with two modes:
- **Add/Subtract Mode:** Add or subtract from existing stats (use negative numbers to subtract)
- **Set Exact Value Mode:** Set stats to specific values

**Available Stats to Edit:**
- Total Sessions
- Total Time (in minutes)
- Weekly Sessions
- Weekly Time (in minutes)
- Active Farms

**Examples:**
```
/addstats user:@John mode:add total_sessions:5 total_time:300
/addstats user:@Jane mode:set weekly_sessions:0 weekly_time:0
```

### `/removestats` - Remove/Reset Statistics
Three actions for managing user stats:
- **Reset All Stats:** Set all stats to 0 (keeps user in database)
- **Reset Weekly Stats:** Only reset weekly stats (preserves total stats)
- **Delete User Completely:** Permanently remove user from database (⚠️ cannot be undone!)

**Examples:**
```
/removestats user:@User action:reset_weekly
/removestats user:@User action:reset_all
```

📖 **Full Documentation:** See `STATS_COMMANDS_GUIDE.md` for detailed usage guide

## What Was Fixed

### Before:
- Commands would execute even if user already had/didn't have the role
- No validation checks

### After:
- `!addhostrole` checks if user already has role → shows error if they do
- `!removehostrole` checks if user has role → shows error if they don't
- Clear error messages for both cases