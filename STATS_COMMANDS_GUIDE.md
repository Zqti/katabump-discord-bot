# 📊 Stats Commands Guide

## Overview
Two powerful slash commands for managing user farm statistics. **Admin/Owner access only.**

---

## `/addstats` - Edit User Statistics

Edit any user's farm statistics with two modes: Add/Subtract or Set Exact Values.

### Command Structure
```
/addstats user:@username mode:[add/set] [stats to modify]
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | User | ✅ Yes | The user to update stats for |
| `mode` | Choice | ✅ Yes | `Add/Subtract` or `Set Exact Value` |
| `total_sessions` | Integer | ❌ No | Total farm sessions |
| `total_time` | Integer | ❌ No | Total time in minutes |
| `weekly_sessions` | Integer | ❌ No | Weekly farm sessions |
| `weekly_time` | Integer | ❌ No | Weekly time in minutes |
| `active_farms` | Integer | ❌ No | Current active farms count |

### Mode Explanations

#### **Add/Subtract Mode**
- Adds or subtracts from current values
- Use positive numbers to add: `+10`
- Use negative numbers to subtract: `-5`
- Stats cannot go below 0

**Examples:**
```
/addstats user:@John mode:add total_sessions:5 total_time:300
→ Adds 5 sessions and 300 minutes to John's stats

/addstats user:@Jane mode:add weekly_time:-60
→ Subtracts 60 minutes from Jane's weekly time

/addstats user:@Bob mode:add total_sessions:1 total_time:60 weekly_sessions:1 weekly_time:60
→ Adds 1 session and 60 minutes to both total and weekly stats
```

#### **Set Exact Value Mode**
- Sets stats to exact values (replaces current values)
- Perfect for corrections or resets
- Stats cannot be set below 0

**Examples:**
```
/addstats user:@John mode:set total_sessions:100 total_time:6000
→ Sets John's stats to exactly 100 sessions and 6000 minutes

/addstats user:@Jane mode:set weekly_sessions:0 weekly_time:0
→ Resets Jane's weekly stats to 0

/addstats user:@Bob mode:set active_farms:0
→ Sets Bob's active farms to 0
```

---

## `/removestats` - Remove/Reset User Statistics

Remove or reset user statistics with three preset actions.

### Command Structure
```
/removestats user:@username action:[reset_all/reset_weekly/delete_user]
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | User | ✅ Yes | The user to remove stats for |
| `action` | Choice | ✅ Yes | What to remove (see actions below) |

### Action Types

#### **Reset All Stats**
- Resets all statistics to 0
- Keeps the user in the database
- User data structure remains intact

**What gets reset:**
- Total Sessions → 0
- Total Time → 0
- Weekly Sessions → 0
- Weekly Time → 0
- Active Farms → 0

**Example:**
```
/removestats user:@John action:reset_all
→ All of John's stats become 0
```

#### **Reset Weekly Stats**
- Only resets weekly statistics
- Total stats remain unchanged
- Useful for weekly resets

**What gets reset:**
- Weekly Sessions → 0
- Weekly Time → 0

**What stays:**
- Total Sessions (unchanged)
- Total Time (unchanged)
- Active Farms (unchanged)

**Example:**
```
/removestats user:@Jane action:reset_weekly
→ Jane's weekly stats reset, but total stats remain
```

#### **Delete User Completely**
- ⚠️ **Permanent action - cannot be undone!**
- Removes user completely from database
- All statistics are lost forever
- Use with extreme caution

**What gets deleted:**
- All statistics permanently removed
- User entry removed from database
- Cannot be recovered

**Example:**
```
/removestats user:@Bob action:delete_user
→ Bob's entire record is deleted permanently
```

---

## Common Use Cases

### 1. **Manual Session Addition**
When a user's farm wasn't tracked properly:
```
/addstats user:@User mode:add total_sessions:1 total_time:60 weekly_sessions:1 weekly_time:60
```

### 2. **Correcting Mistakes**
If wrong stats were added:
```
/addstats user:@User mode:set total_sessions:50 total_time:3000
```

### 3. **Weekly Reset**
At the start of each week:
```
/removestats user:@User action:reset_weekly
```

### 4. **Adjusting Active Farms**
If active farms counter is stuck:
```
/addstats user:@User mode:set active_farms:0
```

### 5. **Complete Reset**
Starting fresh for a user:
```
/removestats user:@User action:reset_all
```

### 6. **Bulk Time Addition**
Adding bonus time for events:
```
/addstats user:@User mode:add total_time:180 weekly_time:180
→ Adds 3 hours to both total and weekly
```

---

## Permissions

**Who can use these commands:**
- ✅ Server Administrators
- ✅ Bot Owner (ID: 1146692880216379423)

**Command responses:**
- All responses are ephemeral (only visible to command user)
- Success messages show before/after values
- Clear tracking of who made changes

---

## Visual Examples

### Success Response (Add Mode)
```
✅ Stats Updated Successfully
Updated stats for @John

📊 Mode: Add/Subtract
👤 Target User: @John
📝 Changes Made:
Total Sessions: 50 → 55 (+5)
Total Time: 3000m → 3300m (+300m)
🔧 Updated By: @Admin
```

### Success Response (Set Mode)
```
✅ Stats Updated Successfully
Updated stats for @Jane

📊 Mode: Set Exact Value
👤 Target User: @Jane
📝 Changes Made:
Weekly Sessions: 12 → 0
Weekly Time: 720m → 0m
🔧 Updated By: @Admin
```

### Success Response (Remove Stats)
```
🗑️ Stats Removed Successfully
Weekly statistics have been reset to 0 for @User

👤 Target User: @User
🔧 Action Performed: Reset Weekly
👮 Executed By: @Admin
```

---

## Tips & Best Practices

1. **Always check current stats first** using `!stats @user` before modifying
2. **Use Add mode for adjustments**, Set mode for corrections
3. **Document major changes** in a log channel
4. **Reset weekly stats regularly** to maintain accurate weekly tracking
5. **Be cautious with delete_user** - it's permanent!
6. **Test with your own account first** before modifying others

---

## Troubleshooting

**"No Data Found" error?**
- User has no statistics yet
- Use `/addstats` in Set mode to initialize their stats

**Stats won't go negative?**
- By design - all stats have a minimum value of 0
- This prevents invalid data

**Changes not showing?**
- Check if bot has write permissions
- Restart the bot if needed: `sudo supervisorctl restart discord_bot`

**Commands not appearing?**
- Global commands can take up to 1 hour
- Run `node deploy-commands.js` to refresh
- Check bot permissions include `applications.commands`

---

## Support

For issues or questions:
1. Check bot logs: `/var/log/supervisor/discord_bot.*.log`
2. Verify bot permissions
3. Ensure you have Administrator role
4. Check if commands are deployed: `node deploy-commands.js`
