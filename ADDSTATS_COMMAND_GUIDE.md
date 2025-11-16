# 📊 /addstats Command Guide

## Quick Reference

### Command Format
```
/addstats user:@username [stat_option:value]
```

### Permissions Required
- 🔑 Bot Owner (ID: 1146692880216379423)
- 👑 Server Administrator

---

## Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `total_sessions` | Add/subtract total farm sessions | `5` or `-2` |
| `total_time` | Add/subtract total time (minutes) | `300` or `-60` |
| `weekly_sessions` | Add/subtract weekly sessions | `3` or `-1` |
| `weekly_time` | Add/subtract weekly time (minutes) | `180` or `-30` |

**Note:** At least ONE option must be provided. Can be negative to subtract.

---

## Usage Examples

### Add Stats
```
/addstats user:@JohnDoe total_sessions:5 total_time:300
```
Result: Adds 5 sessions and 300 minutes (5 hours) to JohnDoe

### Subtract Stats
```
/addstats user:@JohnDoe total_sessions:-2 total_time:-120
```
Result: Removes 2 sessions and 120 minutes (2 hours) from JohnDoe

### Update Single Stat
```
/addstats user:@JohnDoe weekly_time:60
```
Result: Adds 60 minutes (1 hour) to weekly time only

### Update All Stats
```
/addstats user:@JohnDoe total_sessions:10 total_time:600 weekly_sessions:5 weekly_time:300
```
Result: Updates all four stats at once

---

## Response Examples

### Success Response
```
✅ Stats Updated Successfully

Updated stats for @JohnDoe

Changes Made:
Total Sessions: 45 → 50 (+5)
Total Time: 1935m → 2235m (+300m)

Updated By: @AdminName
```

### Error: No Permission
```
❌ You need Administrator permissions or be the bot owner to use this command.
```

### Error: No Stats Provided
```
❌ You must provide at least one stat to update.
```

---

## Important Rules

### 1. Minimum Value Protection
- Stats **cannot go below 0**
- If you subtract more than available, it stops at 0
- Example: User has 3 sessions, you subtract 5 → Result is 0

### 2. Time Format
- All time values are in **minutes**
- 1 hour = 60 minutes
- 5 hours = 300 minutes
- Command automatically converts to hours/minutes for display

### 3. Privacy
- Command response is **ephemeral** (only visible to you)
- Stats are saved immediately to data.json
- Changes reflect instantly in `!stats` command

---

## Common Use Cases

### Reward Bonus Time
```
/addstats user:@TopFarmer total_time:120
```
Give 2 hours bonus for being top farmer

### Penalty for Rule Break
```
/addstats user:@RuleBreaker weekly_time:-60
```
Deduct 1 hour from weekly stats as penalty

### Correct Mistakes
```
/addstats user:@User total_sessions:-1 total_time:-60
```
Remove incorrectly logged session

### Weekly Reset (if needed)
```
/addstats user:@User weekly_sessions:-10 weekly_time:-600
```
Reset weekly stats (subtract current values)

### Add Multiple Users
Run command multiple times:
```
/addstats user:@User1 total_time:300
/addstats user:@User2 total_time:300
/addstats user:@User3 total_time:300
```

---

## Verification

### Check Changes Applied
After using `/addstats`, verify with:
```
!stats @username
```

You'll see the updated stats in the new clean format:
```
📊 Stats for username

Total Sessions
50

Total Time
37h 15m

Weekly Time
10h 5m

Weekly Sessions
14
```

---

## Tips & Best Practice

### ✅ Do:
- Use for corrections when bot miscounts
- Reward active community members
- Apply penalties for rule violations
- Test with small values first
- Double-check username before applying

### ❌ Don't:
- Don't modify stats without reason
- Don't forget it's permanent (log your changes!)
- Don't use for regular session tracking (use !start/!end)
- Don't share this command with regular users

---

## Troubleshooting

### Command Not Appearing?
- Global commands take up to 1 hour to appear
- Try restarting Discord
- Check bot has applications.commands permission

### Command Fails?
- Verify you have Administrator role
- Make sure bot is online
- Check you mentioned a valid user
- Ensure at least one stat option is provided

### Changes Not Saving?
- Check bot has write permissions
- Verify with `!stats` after using command
- Check bot logs: `tail -f /var/log/supervisor/discordbot.out.log`

---

## Admin Log Recommendation

Consider keeping a log of manual stat adjustments:
```
Date: 2025-11-12
Admin: @AdminName
User: @JohnDoe
Change: +5 sessions, +300 minutes
Reason: Compensation for bot downtime
```

This helps track manual interventions and maintain transparency.

---

**Command deployed and ready to use!** 🎉
