require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, Collection, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ----------------------
// Load Slash Commands
// ----------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

const DATA_FILE = path.join(__dirname, 'data.json');
let userStats = {};
let activeFarms = new Map();
let logChannels = { fullFarm: null, earlyEnd: null, lordBan: null };
let lordBans = {};
let reminderChannels = [];
let lastReminderMsg = new Map();
let commandCooldowns = new Map();
let lordbanSetupComplete = false;

// NEW: Data for 336 farm system
let lordBanned = new Set();
let hostRoles = [];
let farmRoles = [];

// ----------------------
// Load & Save
// ----------------------
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    userStats = data.userStats || {};
    activeFarms = new Map(Object.entries(data.activeFarms || {}));
    logChannels = data.logChannels || { fullFarm: null, earlyEnd: null, lordBan: null };
    lordBans = data.lordBans || {};
    reminderChannels = data.reminderChannels || [];
    lordBanned = new Set(data.lordBanned || []);
    hostRoles = data.hostRoles || [];
    farmRoles = data.farmRoles || [];
    lordbanSetupComplete = data.lordbanSetupComplete || false;
  }
}

function saveData() {
  const data = {
    userStats,
    activeFarms: Object.fromEntries(activeFarms),
    logChannels,
    lordBans,
    reminderChannels,
    lordBanned: Array.from(lordBanned),
    hostRoles,
    farmRoles,
    lordbanSetupComplete
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ----------------------
// Helper Functions
// ----------------------
function ensureUserStats(userId) {
  if (!userStats[userId]) {
    userStats[userId] = { totalSessions: 0, totalTime: 0, weeklySessions: 0, weeklyTime: 0, activeFarms: 0 };
  }
}

function msToMinutes(ms) {
  return Math.floor(ms / 60000);
}

function parseDuration(str) {
  const match = /^(\d+)d$/.exec(str);
  if (!match) return null; // Return null if format is invalid
  const value = parseInt(match[1]);
  return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
}

// ----------------------
// Import Embeds
// ----------------------
const {
  embeds,
  startEmbed,
  endEmbed,
  noActiveFarmEmbed,
  ftEmbed,
  statsEmbed,
  timeEmbed
} = require('./embeds');

// ----------------------
// Auto-End System (checks every 30 seconds for precision)
// ----------------------
setInterval(async () => {
  const now = Date.now();

  // Check for expired farms (over 60 minutes) and auto-end them
  for (const [channelId, farm] of activeFarms.entries()) {
    const elapsed = now - farm.startTime;
    const elapsedMinutes = Math.floor(elapsed / 60000);
    
    // If farm has exceeded 60 minutes, automatically end it
    if (elapsedMinutes >= 60) {
      const channel = client.channels.cache.get(channelId);
      
      if (channel) {
        // Create end embed
        const autoEndEmbed = new EmbedBuilder()
          .setTitle('🃏 **Farm Session Ended!**')
          .setColor('#000CEB')
          .setDescription(
            `**Host:** <@${farm.host}>\n` +
            `**Channel:** <#${channelId}>\n` +
            `**Duration:** 60 minutes\n` +
            `💡 *Thanks for hosting! (Auto-ended)*`
          )
          .setTimestamp();
        
        // Send to farm channel immediately
        await channel.send({ embeds: [autoEndEmbed] }).catch(() => {});
        
        // Send to log channel
        if (logChannels.fullFarm) {
          const logCh = client.channels.cache.get(logChannels.fullFarm);
          if (logCh) await logCh.send({ embeds: [autoEndEmbed] }).catch(() => {});
        }
      }
      
      // Update user stats
      ensureUserStats(farm.host);
      userStats[farm.host].totalSessions += 1;
      userStats[farm.host].totalTime += 60; // 60 minutes completed
      userStats[farm.host].weeklySessions += 1;
      userStats[farm.host].weeklyTime = (userStats[farm.host].weeklyTime || 0) + 60;
      
      // Remove from active farms
      activeFarms.delete(channelId);
      saveData();
    }
  }
}, 1 * 1000); // Check every 1 second for instant auto-end

// ----------------------
// Reminder System (every 15 minutes)
// ----------------------
setInterval(async () => {
  const now = Date.now();

  // Send reminder if there are active farms
  if (!activeFarms.size || !reminderChannels.length) return;

  // Helper to format milliseconds into Hh Mm (matching !ft command)
  function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours ? `${hours}h ` : ''}${minutes}m`;
  }

  const embed = new EmbedBuilder()
    .setTitle('Active Farms Reminder')
    .setColor(0x0066FF)
    .setDescription('Here are all current active farms:');

  activeFarms.forEach((farm, channelId) => {
    const endTime = farm.startTime + farm.duration * 60000;
    const remainingMs = endTime - now;
    const remainingStr = formatMs(remainingMs);
    embed.addFields({ 
      name: `Channel: <#${channelId}>`, 
      value: `Host: <@${farm.host}>\nRemaining: ${remainingStr}` 
    });
  });

  for (const chId of reminderChannels) {
    const ch = client.channels.cache.get(chId);
    if (!ch) continue;

    if (lastReminderMsg.has(chId)) {
      const oldMsg = await ch.messages.fetch(lastReminderMsg.get(chId)).catch(() => null);
      if (oldMsg) oldMsg.delete().catch(() => null);
    }

    const sentMsg = await ch.send({ embeds: [embed] });
    lastReminderMsg.set(chId, sentMsg.id);
  }
}, 15 * 60 * 1000);

// ----------------------
// Slash Command Handling
// ----------------------
const { handleLogCommand } = require('./commands/logCommands');

client.logChannels = logChannels;
client.saveData = saveData;
client.userStats = userStats;

client.on('interactionCreate', async interaction => {
  // Handle select menu interactions
  if (interaction.isStringSelectMenu() && interaction.customId === 'help_menu') {
    const category = interaction.values[0];
    let embed;

    if (category === 'farm_commands') {
      embed = new EmbedBuilder()
        .setTitle('Farm Session Commands')
        .setColor(0x0066FF)
        .setDescription(
          '`!start` - Start a 60-minute farm session\n' +
          '`!end` - End your active farm session\n' +
          '`!ft` - Check remaining farm time\n' +
          '`!stats [@user]` - View farm statistics\n\n' +
          'Permissions: Host role required for !start and !end'
        )
        .setTimestamp();
    } else if (category === 'role_commands') {
      embed = new EmbedBuilder()
        .setTitle('Role Management Commands')
        .setColor(0x0066FF)
        .setDescription(
          '`!addhostrole @user` - Give host role to a user\n' +
          '`!removehostrole @user` - Remove host role from a user\n\n' +
          'Permissions: Administrator only'
        )
        .setTimestamp();
    } else if (category === 'mod_commands') {
      embed = new EmbedBuilder()
        .setTitle('Moderation Commands')
        .setColor(0x0066FF)
        .setDescription(
          '`!lordban @user <duration> <reason>` - Ban a user\n' +
          '`!reduceban @user <duration>` - Reduce ban time\n' +
          '`!history [@user]` - View ban history\n\n' +
          'Permissions: Staff, Host, or Admin required\n' +
          'Duration format: 1d, 2d, 3d, 4d, 5d, 6d, 7d (days only)'
        )
        .setTimestamp();
    } else if (category === 'utility_commands') {
      embed = new EmbedBuilder()
        .setTitle('Utility Commands')
        .setColor(0x0066FF)
        .setDescription(
          '`!time` - Show current time in major world cities\n' +
          '`!status <type> <activity> <message>` - Update bot status (Bot Owner only)\n' +
          '`!help` - Show this help menu\n\n' +
          '**Status Examples:**\n' +
          '• `!status online playing "Minecraft"`\n' +
          '• `!status dnd watching "YouTube"`\n' +
          '• `!status streaming streaming "Live" <url>`\n\n' +
          'Available to everyone (except !status)'
        )
        .setTimestamp();
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (['setearlyfarmlog', 'setfullfarmlog', 'setlordbanlog'].includes(interaction.commandName)) {
    await handleLogCommand(interaction, logChannels, saveData);
    return;
  }

  // NEW SLASH COMMANDS
  const { PermissionFlagsBits } = require('discord.js');
  const ownerId = '1146692880216379423';
  const isOwner = interaction.user.id === ownerId;

  // /sethostroles
  if (interaction.commandName === 'sethostroles') {
    if (!isOwner && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    }

    const roles = [
      interaction.options.getRole('role1'),
      interaction.options.getRole('role2'),
      interaction.options.getRole('role3'),
    ].filter(Boolean);

    hostRoles = roles.map(r => r.id);
    saveData();
    return interaction.reply({ content: `Host roles updated: ${roles.map(r => r.name).join(', ')}`, ephemeral: true });
  }

  // /setreminderchannel
  if (interaction.commandName === 'setreminderchannel') {
    if (!isOwner && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    }

    const action = interaction.options.getString('action');
    const channelId = interaction.channel.id;

    if (action === 'add') {
      if (!reminderChannels.includes(channelId)) reminderChannels.push(channelId);
      saveData();
      return interaction.reply({ content: `This channel has been added to reminders.`, ephemeral: true });
    }
    if (action === 'remove') {
      reminderChannels = reminderChannels.filter(id => id !== channelId);
      saveData();
      return interaction.reply({ content: `This channel has been removed from reminders.`, ephemeral: true });
    }
    if (action === 'list') {
      if (!reminderChannels.length) {
        return interaction.reply({ content: `No reminder channels set.`, ephemeral: true });
      }
      const list = reminderChannels.map(id => `<#${id}>`).join(', ');
      return interaction.reply({ content: `Reminder channels: ${list}`, ephemeral: true });
    }
  }

  // /set336roles
  if (interaction.commandName === 'set336roles') {
    if (!isOwner && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'Admin only.', ephemeral: true });
    }

    const roles = [
      interaction.options.getRole('role1'),
      interaction.options.getRole('role2'),
      interaction.options.getRole('role3'),
    ].filter(Boolean);

    farmRoles = roles.map(r => r.id);
    saveData();
    return interaction.reply({ content: `336 farm roles updated: ${roles.map(r => r.name).join(', ')}`, ephemeral: true });
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
  }
});

// ----------------------
// Prefix Commands
// ----------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const member = message.member;

  const cooldownAmount = 3000;
  const userId = message.author.id;
  
  if (commandCooldowns.has(userId)) {
    const expirationTime = commandCooldowns.get(userId) + cooldownAmount;
    if (Date.now() < expirationTime) {
      const timeLeft = (expirationTime - Date.now()) / 1000;
      return message.channel.send({ 
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription(`**Please wait ${timeLeft.toFixed(1)} seconds before using another command.**`)
        ]
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000));
    }
  }
  
  commandCooldowns.set(userId, Date.now());
  setTimeout(() => commandCooldowns.delete(userId), cooldownAmount);

  // ---------- !start ----------
  if (command === '!start') {
    if (!member.roles.cache.some(r => ['Host', 'Staff', 'Admin'].includes(r.name))) {
      return message.channel.send({ embeds: [embeds.noHostPermission] });
    }

    // Check if there's already an active farm in THIS channel
    if (activeFarms.has(message.channel.id)) {
      return message.channel.send({ embeds: [embeds.farmAlreadyActive] });
    }

    // Check if user is already hosting a farm in ANY channel
    const userAlreadyHosting = Array.from(activeFarms.values()).some(farm => farm.host === message.author.id);
    if (userAlreadyHosting) {
      return message.channel.send({ 
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('**You are already hosting a farm in another channel. Please end that farm first.**')
        ]
      });
    }

    const duration = 60;
    activeFarms.set(message.channel.id, {
      host: message.author.id,
      startTime: Date.now(),
      duration
    });

    ensureUserStats(message.author.id);
    userStats[message.author.id].activeFarms += 1;
    saveData();

    const startEmbedMsg = startEmbed(message);
    message.channel.send({ embeds: [startEmbedMsg] });

    if (logChannels.fullFarm) {
      const logCh = client.channels.cache.get(logChannels.fullFarm);
      if (logCh) logCh.send({ embeds: [startEmbedMsg] });
    }
  }

  // ---------- !end ----------
  if (command === '!end') {
    if (!activeFarms.has(message.channel.id)) return message.channel.send({ embeds: [noActiveFarmEmbed] });

    const farm = activeFarms.get(message.channel.id);
    if (farm.host !== message.author.id && !member.roles.cache.some(r => ['Staff', 'Admin'].includes(r.name))) {
      return message.channel.send({ content: '**You do not own this farm session.**' });
    }

    const elapsedMinutes = Math.max(1, Math.floor((Date.now() - farm.startTime) / 60000));
    activeFarms.delete(message.channel.id);

    const endEmbedMsg = endEmbed(message, elapsedMinutes);
    message.channel.send({ embeds: [endEmbedMsg] });

    if (logChannels.fullFarm) {
      const logCh = client.channels.cache.get(logChannels.fullFarm);
      if (logCh) logCh.send({ embeds: [endEmbedMsg] });
    }

    ensureUserStats(farm.host);
    userStats[farm.host].totalSessions += 1;
    userStats[farm.host].totalTime += elapsedMinutes;
    userStats[farm.host].weeklySessions += 1; // Update weekly sessions
    userStats[farm.host].weeklyTime = (userStats[farm.host].weeklyTime || 0) + elapsedMinutes; // Update weekly time
    saveData();
  }

  // ---------- !ft ----------
  if (command === '!ft') {
    const now = Date.now();

    // Get all active sessions that haven't ended yet
    const activeChannelSessions = Array.from(activeFarms.entries())
      .filter(([channelId, farm]) => {
        const endTime = farm.startTime + farm.duration * 60000;
        return endTime > now;
      });

    if (!activeChannelSessions.length) {
      return message.channel.send({
        embeds: [{
          color: 0xFF0000,
          title: '🃏 No Active Sessions',
          description: 'There are no active farm sessions in any channel.'
        }]
      });
    }

    // Helper to format milliseconds into Hh Mm (no seconds)
    function formatMs(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours ? `${hours}h ` : ''}${minutes}m`;
    }

    // Build an embed description listing each channel with host and remaining time
    const description = activeChannelSessions
      .map(([channelId, farm]) => {
        const endTime = farm.startTime + farm.duration * 60000;
        const remainingMs = endTime - now;
        const remainingStr = formatMs(remainingMs);
        return `Host <@${farm.host}>\n**Channel:** <#${channelId}>\n**Remaining:** ${remainingStr}`;
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0x0066FF)
      .setTitle('🃏 Active Farms')
      .setDescription(description)
      .setFooter({ text: 'Keep Farming Almost there' });

    message.channel.send({ embeds: [embed] });
  }

  // ---------- !stats ----------
  if (command === '!stats') {
    const user = message.mentions.users.first() || message.author;
    ensureUserStats(user.id);

    const stats = userStats[user.id];
    const statsEmbedMsg = statsEmbed(user, stats);
    message.channel.send({ embeds: [statsEmbedMsg] });
  }

  // ---------- !help ----------
  if (command === '!help') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Bot Commands')
      .setColor(0x0066FF)
      .setDescription('Select a category from the menu below to view commands')
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('Choose a command category')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Farm Session Commands')
          .setDescription('Start, end, and manage farm sessions')
          .setValue('farm_commands')
          .setEmoji('🌾'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Role Management')
          .setDescription('Add or remove host roles')
          .setValue('role_commands')
          .setEmoji('👑'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Moderation Commands')
          .setDescription('Ban, reduce, and view history')
          .setValue('mod_commands')
          .setEmoji('🔨'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Utility Commands')
          .setDescription('Time and other helpful commands')
          .setValue('utility_commands')
          .setEmoji('⚙️')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);
    message.channel.send({ embeds: [helpEmbed], components: [row] });
  }

  // ---------- !time ----------
  if (command === '!time') {
    const now = new Date();
    const timeEmbedMsg = timeEmbed(now);
    message.channel.send({ embeds: [timeEmbedMsg] });
  }

  // ---------- !336 ----------
  if (command === '!336') {
    const allowedRoles = ['Host', 'Staff', 'Admin'];
    const ownerId = '1146692880216379423';
    const isOwner = message.author.id === ownerId;

    const hasPermission = isOwner || message.member.roles.cache.some(r => allowedRoles.includes(r.name));
    if (!hasPermission) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('**You need Host, Staff, or Admin role to use this command.**')
        ]
      });
    }

    if (!farmRoles.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('**No roles have been set for 3-3-6 farm yet.**')
        ]
      });
    }

    const mentionList = farmRoles.map(id => `<@&${id}>`).join(' ');
    message.channel.send(`${mentionList}\n# Need all roles for 3-3-6 farm. CANNOT FULLY AFK.`);
  }

  // ---------- !status ----------
  if (command === '!status') {
    const ownerId = '1146692880216379423';
    
    if (message.author.id !== ownerId) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**This command is only available to the bot owner.**')
      ]});
    }

    const { ActivityType } = require('discord.js');
    
    // Parse arguments
    const statusType = args[0]?.toLowerCase(); // online, idle, dnd, streaming
    const activityType = args[1]?.toLowerCase(); // playing, watching, listening, streaming
    const statusText = args.slice(2).join(' ').replace(/^["']|["']$/g, ''); // Remove quotes if present
    
    if (!statusType) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setTitle('📊 Bot Status Command')
        .setDescription(
          '**Usage:** `!status <type> <activity> <message> [url]`\n\n' +
          '**Status Types:**\n' +
          '• `online` - Green status\n' +
          '• `idle` - Yellow status\n' +
          '• `dnd` - Red status (Do Not Disturb)\n' +
          '• `invisible` - Invisible status\n\n' +
          '**Activity Types:**\n' +
          '• `playing` - Playing <game>\n' +
          '• `watching` - Watching <something>\n' +
          '• `listening` - Listening to <music>\n' +
          '• `streaming` - Streaming (requires URL)\n\n' +
          '**Examples:**\n' +
          '`!status online playing "Minecraft"`\n' +
          '`!status dnd watching "YouTube"`\n' +
          '`!status idle listening "Spotify"`\n' +
          '`!status streaming streaming "Live Stream" https://twitch.tv/username`'
        )
        .setTimestamp()
      ]});
    }

    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    if (!validStatuses.includes(statusType)) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**Invalid status type! Use: online, idle, dnd, or invisible**')
      ]});
    }

    // Set presence based on activity type
    try {
      let presenceData = { status: statusType };
      
      if (activityType && statusText) {
        let activityTypeEnum;
        
        switch(activityType) {
          case 'playing':
            activityTypeEnum = ActivityType.Playing;
            break;
          case 'watching':
            activityTypeEnum = ActivityType.Watching;
            break;
          case 'listening':
            activityTypeEnum = ActivityType.Listening;
            break;
          case 'streaming':
            activityTypeEnum = ActivityType.Streaming;
            // For streaming, we need a URL (last argument)
            const streamUrl = args[args.length - 1];
            if (!streamUrl.startsWith('http')) {
              return message.channel.send({ embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription('**Streaming requires a valid URL (Twitch or YouTube)**')
              ]});
            }
            presenceData.activities = [{
              name: statusText,
              type: activityTypeEnum,
              url: streamUrl
            }];
            break;
          default:
            return message.channel.send({ embeds: [new EmbedBuilder()
              .setColor(0xFF0000)
              .setDescription('**Invalid activity type! Use: playing, watching, listening, or streaming**')
            ]});
        }
        
        if (activityType !== 'streaming') {
          presenceData.activities = [{
            name: statusText,
            type: activityTypeEnum
          }];
        }
      }

      await client.user.setPresence(presenceData);

      const statusEmoji = {
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        invisible: '⚫'
      };

      const activityText = activityType && statusText ? 
        `\n**Activity:** ${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ${statusText}` : '';

      message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Bot Status Updated')
        .setDescription(
          `${statusEmoji[statusType]} **Status:** ${statusType.charAt(0).toUpperCase() + statusType.slice(1)}${activityText}`
        )
        .setTimestamp()
      ]});
    } catch (error) {
      console.error('Error setting status:', error);
      message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**Failed to update bot status. Please try again.**')
      ]});
    }
  }

  // ---------- !lordban ----------
  if (command === '!lordban') {
    if (!message.member.roles.cache.some(r => ['Host', 'Staff'].includes(r.name)) && !message.member.permissions.has('Administrator')) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Staff, Host, or Admin role to use this command.**')
      ]});
    }

    const target = message.mentions.members.first();
    const durationArg = args[1] || '7d';
    const reason = args.slice(2).join(' ') || 'No reason provided';
    const lordBanRoleId = '1434570143379357778';

    if (!target) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Lord Ban Failed')
        .setDescription('You must mention a user to ban.')
      ]});
    }

    const durationMs = parseDuration(durationArg);
    if (!durationMs) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Invalid Duration')
        .setDescription('**Duration must be in days format only (e.g., 1d, 2d, 3d, 4d, 5d, 6d, 7d)**')
      ]});
    }

    const lordBanRole = message.guild.roles.cache.get(lordBanRoleId);
    if (!lordBanRole) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription('Lord Ban role not found in this server. Please contact an administrator.')
      ]});
    }

    if (target.roles.cache.has(lordBanRoleId)) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Already Banned')
        .setDescription(`${target} is already under a Lord Ban.`)
      ]});
    }

    const expiresAt = Date.now() + durationMs;

    await target.roles.add(lordBanRoleId).catch(() => {});

    if (!lordBans[target.id]) {
      lordBans[target.id] = { count: 0, history: [] };
    }

    lordBans[target.id].count = (lordBans[target.id].count || 0) + 1;
    lordBans[target.id].duration = durationArg;
    lordBans[target.id].reason = reason;
    lordBans[target.id].issuedBy = message.author.id;
    lordBans[target.id].issuedAt = Date.now();
    lordBans[target.id].expiresAt = expiresAt;
    
    if (!lordBans[target.id].history) lordBans[target.id].history = [];
    lordBans[target.id].history.push({
      reason,
      issuedBy: message.author.id,
      issuedAt: Date.now(),
      expiresAt,
      duration: durationArg
    });

    saveData();

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔨 Lord Ban Issued')
      .addFields(
        { name: 'User', value: `${target}`, inline: true },
        { name: 'Issued By', value: `${message.author}`, inline: true },
        { name: 'Duration', value: durationArg, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: `Expires at: ${new Date(expiresAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    if (logChannels.lordBan) {
      const logCh = client.channels.cache.get(logChannels.lordBan);
      if (logCh) logCh.send({ embeds: [embed] });
    }

    setTimeout(async () => {
      try {
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (member && member.roles.cache.has(lordBanRoleId)) {
          await member.roles.remove(lordBanRoleId).catch(() => {});
          
          if (lordBans[target.id]) {
            lordBans[target.id].expired = true;
            saveData();
          }

          const expiryEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🔓 Lord Ban Expired')
            .setDescription(`${target}'s Lord Ban has automatically expired.`)
            .setTimestamp();

          if (logChannels.lordBan) {
            const logCh = client.channels.cache.get(logChannels.lordBan);
            if (logCh) logCh.send({ embeds: [expiryEmbed] });
          }
        }
      } catch (error) {
        console.error('Error removing expired ban:', error);
      }
    }, durationMs);
  }

  // ---------- !reduceban ----------
  if (command === '!reduceban') {
    if (!message.member.permissions.has('Administrator') && message.author.id !== '1146692880216379423') {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setDescription('**You need Administrator permissions to reduce bans.**')
      ]});
    }

    const target = message.mentions.members.first();
    const reduceByArg = args[1] || '1d';

    if (!target) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setTitle('Invalid Target')
        .setDescription('You must mention a user whose ban you want to reduce.')
      ]});
    }

    const reduceMs = parseDuration(reduceByArg);
    if (!reduceMs) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Invalid Duration')
        .setDescription('**Duration must be in days format only (e.g., 1d, 2d, 3d, 4d, 5d, 6d, 7d)**')
      ]});
    }

    const lordBanRoleId = '1434570143379357778';
    if (!target.roles.cache.has(lordBanRoleId)) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setDescription('**This user is not currently lord banned.**')
      ]});
    }

    if (!lordBans[target.id]) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setTitle('No Active Ban')
        .setDescription('This user has no recorded ban data.')
      ]});
    }

    if (!lordBans[target.id].expiresAt) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0x0066FF)
        .setTitle('Error')
        .setDescription('Ban has no expiration date stored. This may be from an old ban format.')
      ]});
    }

    const currentExpires = lordBans[target.id].expiresAt;
    const newExpires = Math.max(Date.now(), currentExpires - reduceMs);

    lordBans[target.id].expiresAt = newExpires;

    if (newExpires <= Date.now()) {
      await target.roles.remove(lordBanRoleId).catch(() => {});
      lordBans[target.id].expired = true;
      saveData();

      const removedEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Ban Removed')
        .setDescription(`${target}'s lord ban has been fully reduced and removed.`)
        .setTimestamp();

      message.channel.send({ embeds: [removedEmbed] });
    } else {
      saveData();

      const reducedEmbed = new EmbedBuilder()
        .setColor(0xFFCC00)
        .setTitle('⏳ Ban Duration Reduced')
        .addFields(
          { name: 'User', value: `${target}`, inline: true },
          { name: 'Reduced By', value: reduceByArg, inline: true },
          { name: 'New Expiration', value: `<t:${Math.floor(newExpires / 1000)}:F>`, inline: true }
        )
        .setTimestamp();

      message.channel.send({ embeds: [reducedEmbed] });
    }
  }

  // ---------- !history ----------
  if (command === '!history') {
    if (!member.roles.cache.some(r => ['Host', 'Staff', 'Admin'].includes(r.name))) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Staff, Host, or Admin role to check ban history.**')
      ]});
    }

    const target = message.mentions.users.first() || message.author;
    const banInfo = lordBans[target.id];

    if (!banInfo) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setTitle('**Ban History**')
        .setColor(0x0066FF)
        .setDescription(`${target.username} has no lord ban history.`)
      ]});
    }

    const totalBans = banInfo.count || 1;
    const isCurrentlyBanned = message.guild.members.cache.get(target.id)?.roles.cache.has('1434570143379357778');

    const historyEmbed = new EmbedBuilder()
      .setTitle('📜 **Ban History**')
      .setColor(0x0066FF)
      .setDescription(
        `**User:** ${target}\n` +
        `**Total Bans:** ${totalBans}\n` +
        `**Currently Banned:** ${isCurrentlyBanned ? '✅ Yes' : '❌ No'}`
      );

    if (banInfo.duration) {
      historyEmbed.addFields(
        { name: 'Latest Duration', value: banInfo.duration, inline: true },
        { name: 'Latest Reason', value: banInfo.reason || 'No reason provided', inline: false },
        { name: 'Issued By', value: `<@${banInfo.issuedBy}>`, inline: true },
        { name: 'Issued At', value: `<t:${Math.floor(banInfo.issuedAt / 1000)}:F>`, inline: true }
      );

      if (banInfo.expiresAt && !banInfo.expired) {
        historyEmbed.addFields({
          name: 'Expires At',
          value: `<t:${Math.floor(banInfo.expiresAt / 1000)}:F>`,
          inline: true
        });
      }
    }

    if (banInfo.history && banInfo.history.length > 0) {
      const historyText = banInfo.history.slice(-3).map((ban, idx) => {
        return `**${idx + 1}.** ${ban.duration} - ${ban.reason} (by <@${ban.issuedBy}>)`;
      }).join('\n');

      historyEmbed.addFields({
        name: `📝 Recent History (Last ${Math.min(3, banInfo.history.length)})`,
        value: historyText,
        inline: false
      });
    }

    message.channel.send({ embeds: [historyEmbed] });
  }

  // ---------- !addhostrole ----------
  if (command === '!addhostrole') {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Administrator permissions to add roles.**')
      ]});
    }

    const target = message.mentions.members.first();
    let roleToAdd = message.mentions.roles.first();

    // If no role mentioned, check if args[1] is a role ID
    if (!roleToAdd && args[1]) {
      roleToAdd = message.guild.roles.cache.get(args[1]);
    }

    if (!target) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Missing User')
        .setDescription('**Please mention a user and a role.**\n\n**Usage:** `!addhostrole @user @role` or `!addhostrole @user <role_id>`')
        .setTimestamp()
      ]});
    }

    if (!roleToAdd) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Missing Role')
        .setDescription('**Please mention which role to add.**\n\n**Usage:** `!addhostrole @user @role` or `!addhostrole @user <role_id>`')
        .setTimestamp()
      ]});
    }

    // Check if user already has the role
    if (target.roles.cache.has(roleToAdd.id)) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Role Already Added')
        .setDescription(`${target} already has the ${roleToAdd} role.`)
        .setTimestamp()
      ]});
    }

    await target.roles.add(roleToAdd).catch(() => {});
    const addEmbed = new EmbedBuilder()
      .setTitle('Role Added')
      .setColor(0x1ABC9C)
      .setDescription(`${target} has been given the ${roleToAdd} role.`)
      .setTimestamp();
    message.channel.send({ embeds: [addEmbed] });
  }

  // ---------- !removehostrole ----------
  if (command === '!removehostrole') {
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Administrator permissions to remove roles.**')
      ]});
    }

    const target = message.mentions.members.first();
    let roleToRemove = message.mentions.roles.first();

    // If no role mentioned, check if args[1] is a role ID
    if (!roleToRemove && args[1]) {
      roleToRemove = message.guild.roles.cache.get(args[1]);
    }

    if (!target) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Missing User')
        .setDescription('**Please mention a user and a role.**\n\n**Usage:** `!removehostrole @user @role` or `!removehostrole @user <role_id>`')
        .setTimestamp()
      ]});
    }

    if (!roleToRemove) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Missing Role')
        .setDescription('**Please mention which role to remove.**\n\n**Usage:** `!removehostrole @user @role` or `!removehostrole @user <role_id>`')
        .setTimestamp()
      ]});
    }

    // Check if user doesn't have the role
    if (!target.roles.cache.has(roleToRemove.id)) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Role Not Found')
        .setDescription(`${target} does not have the ${roleToRemove} role.`)
        .setTimestamp()
      ]});
    }

    await target.roles.remove(roleToRemove).catch(() => {});
    const removeEmbed = new EmbedBuilder()
      .setTitle('Role Removed')
      .setColor(0xE74C3C)
      .setDescription(`${target} has had the ${roleToRemove} role removed.`)
      .setTimestamp();
    message.channel.send({ embeds: [removeEmbed] });
  }

  // ---------- !setuplordban ----------
  if (command === '!setuplordban') {
    const ownerId = '1146692880216379423';
    const isOwner = message.author.id === ownerId;
    const isAdmin = message.member.permissions.has('Administrator');

    if (!isOwner && !isAdmin) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Administrator permissions or be the bot owner to setup lordban.**')
      ]});
    }

    if (lordbanSetupComplete) {
      return message.channel.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Setup Already Complete')
        .setDescription('**Lordban system has already been set up. The setup cannot be run again.**')
        .setTimestamp()
      ]});
    }

    const setupEmbed = new EmbedBuilder()
      .setTitle('Setting Up Lordban System')
      .setColor(0xFFA500)
      .setDescription('Creating lordban role, category, channels, and configuring permissions...\nThis may take a moment.')
      .setTimestamp();
    
    const statusMsg = await message.channel.send({ embeds: [setupEmbed] });

    try {
      // Create or find lordban role
      let lordbanRole = message.guild.roles.cache.find(r => r.name === 'lordban');
      
      if (!lordbanRole) {
        lordbanRole = await message.guild.roles.create({
          name: 'lordban',
          color: 0x000000,
          reason: 'Lordban role created by !setuplordban command'
        });
      }

      // Get Staff, Admin, Mod roles
      const staffRole = message.guild.roles.cache.find(r => r.name === 'Staff');
      const adminRole = message.guild.roles.cache.find(r => r.name === 'Admin');
      const modRole = message.guild.roles.cache.find(r => r.name === 'Mod');

      // Create permission overwrites for category - hide from @everyone, show to staff/admin/mod
      const categoryPermissions = [
        {
          id: message.guild.roles.everyone.id,
          deny: ['ViewChannel']
        }
      ];
      
      if (staffRole) categoryPermissions.push({ id: staffRole.id, allow: ['ViewChannel'] });
      if (adminRole) categoryPermissions.push({ id: adminRole.id, allow: ['ViewChannel'] });
      if (modRole) categoryPermissions.push({ id: modRole.id, allow: ['ViewChannel'] });

      // Create lordbans category
      let category = message.guild.channels.cache.find(ch => ch.type === 4 && ch.name === 'lordbans');
      
      if (!category) {
        category = await message.guild.channels.create({
          name: 'lordbans',
          type: 4,
          permissionOverwrites: categoryPermissions,
          reason: 'Category created by !setuplordban command'
        });
      } else {
        // Update permissions on existing category
        for (const perm of categoryPermissions) {
          await category.permissionOverwrites.edit(perm.id, perm.allow ? { ViewChannel: true } : { ViewChannel: false });
        }
      }

      // Create Logs channel
      let logsChannel = category.children.cache.find(ch => ch.name === 'logs');
      if (!logsChannel) {
        logsChannel = await message.guild.channels.create({
          name: 'logs',
          type: 0,
          parent: category.id,
          topic: 'all lordban actions and history are logged here for transparency',
          reason: 'Logs channel created by !setuplordban command'
        });
      }

      // Create Lordban channel with lordban role permissions
      let lordbanChannel = category.children.cache.find(ch => ch.name === 'lordban');
      if (!lordbanChannel) {
        const lordbanChannelPerms = [...categoryPermissions];
        if (lordbanRole) {
          lordbanChannelPerms.push({
            id: lordbanRole.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          });
        }

        lordbanChannel = await message.guild.channels.create({
          name: 'lordban',
          type: 0,
          parent: category.id,
          permissionOverwrites: lordbanChannelPerms,
          topic: 'users with lordban role can only see this channel',
          reason: 'Lordban channel created by !setuplordban command'
        });
      }

      // Set lord ban log to Logs channel automatically
      logChannels.lordBan = logsChannel.id;
      saveData();

      // Get all channels except the ones in lordbans category
      const channels = message.guild.channels.cache.filter(ch => 
        (ch.type === 0 || ch.type === 2) && ch.parentId !== category.id
      );
      
      let successCount = 0;
      let failedChannels = [];

      for (const [id, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(lordbanRole.id, {
            ViewChannel: false,
            SendMessages: false,
            Connect: false,
            Speak: false
          });
          successCount++;
        } catch (err) {
          failedChannels.push(channel.name);
        }
      }

      let description = `Lordban role: ${lordbanRole}\n` +
        `Category created: lordbans (visible to Staff/Admin/Mod only)\n` +
        `Channels created: logs, lordban\n` +
        `Lord ban logs set to: ${logsChannel}\n\n` +
        `Channels configured: ${successCount}`;

      if (failedChannels.length > 0) {
        description += `\nFailed channels: ${failedChannels.join(', ')}`;
      }

      // Mark setup as complete
      lordbanSetupComplete = true;
      saveData();

      const completeEmbed = new EmbedBuilder()
        .setTitle('✅ Lordban Setup Complete')
        .setColor(0x0066FF)
        .setDescription(description)
        .setFooter({ text: 'Setup cannot be run again' })
        .setTimestamp();

      await statusMsg.edit({ embeds: [completeEmbed] });

    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Setup Failed')
        .setColor(0xFF0000)
        .setDescription(`Error: ${error.message}\n\nMake sure the bot has proper permissions.\n\n**You can try running !setuplordban again.**`)
        .setTimestamp();
      
      await statusMsg.edit({ embeds: [errorEmbed] });
      // Don't mark as complete if it failed
    }
  }
});

// ----------------------
// Bot Ready
// ----------------------
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  loadData();
  console.log(`📊 Loaded ${reminderChannels.length} reminder channels`);
  console.log(`📊 Loaded ${farmRoles.length} 336 farm roles`);
  console.log(`📊 Loaded ${hostRoles.length} host roles`);
  
  // Set bot status to DND watching "lord farms"
  const { ActivityType } = require('discord.js');
  client.user.setPresence({
    status: 'dnd',
    activities: [{
      name: 'lord farms',
      type: ActivityType.Watching
    }]
  });
  console.log('🔴 Status set to DND - Watching lord farms');
});

// ----------------------
// Login
// ----------------------
client.login(process.env.DISCORD_TOKEN);