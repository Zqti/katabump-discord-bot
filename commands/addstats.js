const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

function ensureUserStats(userId, userStats) {
  if (!userStats[userId]) {
    userStats[userId] = { totalSessions: 0, totalTime: 0, weeklySessions: 0, weeklyTime: 0, activeFarms: 0 };
  }
}

function saveDataToFile() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addstats')
    .setDescription('Add to user farm statistics (Admin/Owner only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to update stats for')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('total_sessions')
        .setDescription('Number of total sessions to add')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('total_time_hours')
        .setDescription('Hours to add to total time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('total_time_minutes')
        .setDescription('Minutes to add to total time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_sessions')
        .setDescription('Number of weekly sessions to add')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_time_hours')
        .setDescription('Hours to add to weekly time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_time_minutes')
        .setDescription('Minutes to add to weekly time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('active_farms')
        .setDescription('Active farms count to add')
        .setRequired(false)),

  async execute(interaction) {
    const ownerId = '1146692880216379423';
    const isOwner = interaction.user.id === ownerId;
    const isAdmin = interaction.member.permissions.has('Administrator');

    // Permission check
    if (!isOwner && !isAdmin) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**⛔ Access Denied**\nYou need Administrator permissions or be the bot owner to use this command.');
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const totalSessions = interaction.options.getInteger('total_sessions');
    const totalTimeHours = interaction.options.getInteger('total_time_hours') || 0;
    const totalTimeMinutes = interaction.options.getInteger('total_time_minutes') || 0;
    const weeklySessions = interaction.options.getInteger('weekly_sessions');
    const weeklyTimeHours = interaction.options.getInteger('weekly_time_hours') || 0;
    const weeklyTimeMinutes = interaction.options.getInteger('weekly_time_minutes') || 0;
    const activeFarms = interaction.options.getInteger('active_farms');

    // Convert hours and minutes to total minutes
    const totalTimeToAdd = (totalTimeHours * 60) + totalTimeMinutes;
    const weeklyTimeToAdd = (weeklyTimeHours * 60) + weeklyTimeMinutes;

    // Check if at least one stat was provided
    if (totalSessions === null && totalTimeToAdd === 0 && weeklySessions === null && weeklyTimeToAdd === 0 && activeFarms === null) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**⚠️ No Stats Provided**\nYou must provide at least one stat to update.');
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Get data from file since we need to modify it
    let data;
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE));
    } else {
      data = { userStats: {} };
    }
    
    // Initialize user stats if they don't exist
    if (!data.userStats[targetUser.id]) {
      data.userStats[targetUser.id] = {
        totalSessions: 0,
        totalTime: 0,
        weeklySessions: 0,
        weeklyTime: 0,
        activeFarms: 0
      };
    }

    const userStats = data.userStats[targetUser.id];
    const changes = [];

    // Add stats mode only
    if (totalSessions !== null) {
      const oldValue = userStats.totalSessions;
      userStats.totalSessions = Math.max(0, userStats.totalSessions + totalSessions);
      changes.push(`Total Sessions: ${oldValue} → ${userStats.totalSessions} (+${totalSessions})`);
    }

    if (totalTimeToAdd > 0) {
      const oldValue = userStats.totalTime;
      userStats.totalTime = Math.max(0, userStats.totalTime + totalTimeToAdd);
      const addedHours = Math.floor(totalTimeToAdd / 60);
      const addedMinutes = totalTimeToAdd % 60;
      const oldHours = Math.floor(oldValue / 60);
      const oldMinutes = oldValue % 60;
      const newHours = Math.floor(userStats.totalTime / 60);
      const newMinutes = userStats.totalTime % 60;
      changes.push(`Total Time: ${oldHours}h ${oldMinutes}m → ${newHours}h ${newMinutes}m (+${addedHours}h ${addedMinutes}m)`);
    }

    if (weeklySessions !== null) {
      const oldValue = userStats.weeklySessions;
      userStats.weeklySessions = Math.max(0, userStats.weeklySessions + weeklySessions);
      changes.push(`Weekly Sessions: ${oldValue} → ${userStats.weeklySessions} (+${weeklySessions})`);
    }

    if (weeklyTimeToAdd > 0) {
      const oldValue = userStats.weeklyTime || 0;
      userStats.weeklyTime = Math.max(0, (userStats.weeklyTime || 0) + weeklyTimeToAdd);
      const addedHours = Math.floor(weeklyTimeToAdd / 60);
      const addedMinutes = weeklyTimeToAdd % 60;
      const oldHours = Math.floor(oldValue / 60);
      const oldMinutes = oldValue % 60;
      const newHours = Math.floor(userStats.weeklyTime / 60);
      const newMinutes = userStats.weeklyTime % 60;
      changes.push(`Weekly Time: ${oldHours}h ${oldMinutes}m → ${newHours}h ${newMinutes}m (+${addedHours}h ${addedMinutes}m)`);
    }

    if (activeFarms !== null) {
      const oldValue = userStats.activeFarms || 0;
      userStats.activeFarms = Math.max(0, (userStats.activeFarms || 0) + activeFarms);
      changes.push(`Active Farms: ${oldValue} → ${userStats.activeFarms} (+${activeFarms})`);
    }

    // Save updated data to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Stats Added Successfully')
      .setDescription(`Updated stats for ${targetUser}`)
      .addFields(
        { name: '👤 Target User', value: `${targetUser}`, inline: true },
        { name: '📝 Changes Made', value: changes.length > 0 ? changes.join('\n') : 'No changes', inline: false },
        { name: '🔧 Updated By', value: `${interaction.user}`, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  },
};