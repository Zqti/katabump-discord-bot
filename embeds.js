const { EmbedBuilder } = require('discord.js');

// ----------------------
// General Embeds
// ----------------------
const embeds = {
  noHostPermission: new EmbedBuilder()
    .setColor(0x0066FF)
    .setDescription('**You need the Host role to start a farm.**'),

  farmAlreadyActive: new EmbedBuilder()
    .setColor(0xFF0000)
    .setDescription('**A farm is already active in this channel.**'),

  lordBanUsage: new EmbedBuilder()
    .setColor(0xFF0000)
    .setDescription('**Usage: !lordban @user duration reason**\nHost/Admin only.'),

  alreadyLordBanned: new EmbedBuilder()
    .setColor(0xFF0000)
    .setDescription('**That user is already lord banned.**')
};

// ----------------------
// !start Embed
// ----------------------
const startEmbed = (message) => new EmbedBuilder()
  .setTitle('🃏 **Farm Session Started!**')
  .setColor('#000CEB')
  .setDescription(
    `**Host:** ${message.author}\n` +
    `**Channel:** <#${message.channel.id}>\n` +
    `**Duration:** 60 minutes\n` +
    `😸 *Stay active and enjoy the farm!*`
  )
  .setTimestamp();

// ----------------------
// !end Embed
// ----------------------
const endEmbed = (message, duration = 60) => new EmbedBuilder()
  .setTitle('🃏 **Farm Session Ended!**')
  .setColor('#000CEB')
  .setDescription(
    `**Host:** ${message.author}\n` +
    `**Channel:** <#${message.channel.id}>\n` +
    `**Duration:** ${duration} minutes\n` +
    `💡 *Thanks for hosting!*`
  )
  .setTimestamp();

const noActiveFarmEmbed = new EmbedBuilder()
  .setTitle('🃏 **No Active Farm Found**')
  .setColor('#000CEB')
  .setDescription('**There\'s no active farm in this channel.**');

// ----------------------
// !ft Embed
// ----------------------
const ftEmbed = (message, remainingMinutes) => new EmbedBuilder()
  .setTitle('🃏 **Remaining Farm Time**')
  .setColor('#000CEB')
  .setDescription(
    `**Channel:** <#${message.channel.id}>\n` +
    `**Time Left:** ${remainingMinutes} minutes\n` +
    `⏳ *Keep farming, almost there!*`
  );

// ----------------------
// !stats Embed - RED WITH BOLD TEXT
// ----------------------
const statsEmbed = (user, stats) => {
  const totalHours = Math.floor(stats.totalTime / 60);
  const totalMinutes = stats.totalTime % 60;
  const weeklyHours = Math.floor((stats.weeklyTime || 0) / 60);
  const weeklyMinutes = (stats.weeklyTime || 0) % 60;
  
  return new EmbedBuilder()
    .setColor('#FF0000') // Red color
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
    .setDescription(`📊 **Stats for ${user.username}**`)
    .addFields(
      { 
        name: '**Total Sessions**', 
        value: `**${stats.totalSessions}**`,
        inline: false
      },
      { 
        name: '**Total Time**', 
        value: `**${totalHours}h ${totalMinutes}m**`,
        inline: false
      },
      { 
        name: '**Weekly Time**', 
        value: `**${weeklyHours}h ${weeklyMinutes}m**`,
        inline: false
      },
      { 
        name: '**Weekly Sessions**', 
        value: `**${stats.weeklySessions}**`,
        inline: false
      }
    )
    .setTimestamp();
};

// ----------------------
// !time Embed
// ----------------------
const timeEmbed = (now) => new EmbedBuilder()
  .setTitle('🌍 **World Time**')
  .setColor(0x0066FF)
  .setDescription(
    `🇺🇸 **New York:** ${now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇬🇧 **London:** ${now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇯🇵 **Tokyo:** ${now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇦🇪 **Dubai:** ${now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇦🇺 **Sydney:** ${now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇧🇷 **São Paulo:** ${now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}\n` +
    `🇸🇦 **Dammam:** ${now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' })}`
  );

module.exports = {
  embeds,
  startEmbed,
  endEmbed,
  noActiveFarmEmbed,
  ftEmbed,
  statsEmbed,
  timeEmbed
};