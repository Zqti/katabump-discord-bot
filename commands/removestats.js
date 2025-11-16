const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removestats')
    .setDescription('Remove user farm statistics (Admin/Owner only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove stats from')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('What to remove')
        .setRequired(true)
        .addChoices(
          { name: 'Reset All Stats', value: 'reset_all' },
          { name: 'Reset Weekly Stats', value: 'reset_weekly' },
          { name: 'Delete User Completely', value: 'delete_user' },
          { name: 'Remove Specific Stats', value: 'remove_specific' }
        ))
    .addIntegerOption(option =>
      option.setName('total_sessions')
        .setDescription('Number of total sessions to remove')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('total_time_hours')
        .setDescription('Hours to remove from total time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('total_time_minutes')
        .setDescription('Minutes to remove from total time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_sessions')
        .setDescription('Number of weekly sessions to remove')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_time_hours')
        .setDescription('Hours to remove from weekly time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('weekly_time_minutes')
        .setDescription('Minutes to remove from weekly time')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('active_farms')
        .setDescription('Active farms count to remove')
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
    const action = interaction.options.getString('action');

    // Get data from file
    let data;
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE));
    } else {
      data = { userStats: {} };
    }
    
    // Check if user exists
    if (!data.userStats[targetUser.id]) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription(`**⚠️ No Data Found**\n${targetUser} has no statistics recorded.`);
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const userStats = data.userStats[targetUser.id];
    let resultMessage = '';
    let resultColor = 0x00FF00;
    const changes = [];

    // Perform action
    if (action === 'reset_all') {
      data.userStats[targetUser.id] = {
        totalSessions: 0,
        totalTime: 0,
        weeklySessions: 0,
        weeklyTime: 0,
        activeFarms: 0
      };
      resultMessage = `All statistics have been reset to 0 for ${targetUser}`;
    } else if (action === 'reset_weekly') {
      data.userStats[targetUser.id].weeklySessions = 0;
      data.userStats[targetUser.id].weeklyTime = 0;
      resultMessage = `Weekly statistics have been reset to 0 for ${targetUser}`;
    } else if (action === 'delete_user') {
      delete data.userStats[targetUser.id];
      resultMessage = `All data for ${targetUser} has been permanently deleted`;
      resultColor = 0xFF0000;
    } else if (action === 'remove_specific') {
      // Handle specific stat removal with hours and minutes support
      const totalSessions = interaction.options.getInteger('total_sessions');
      const totalTimeHours = interaction.options.getInteger('total_time_hours') || 0;
      const totalTimeMinutes = interaction.options.getInteger('total_time_minutes') || 0;
      const weeklySessions = interaction.options.getInteger('weekly_sessions');
      const weeklyTimeHours = interaction.options.getInteger('weekly_time_hours') || 0;
      const weeklyTimeMinutes = interaction.options.getInteger('weekly_time_minutes') || 0;
      const activeFarms = interaction.options.getInteger('active_farms');

      // Convert hours and minutes to total minutes
      const totalTimeToRemove = (totalTimeHours * 60) + totalTimeMinutes;
      const weeklyTimeToRemove = (weeklyTimeHours * 60) + weeklyTimeMinutes;

      // Check if at least one stat was provided
      if (totalSessions === null && totalTimeToRemove === 0 && weeklySessions === null && weeklyTimeToRemove === 0 && activeFarms === null) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setDescription('**⚠️ No Stats Provided**\nYou must provide at least one stat to remove when using "Remove Specific Stats" action.');
        
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Remove specific stats
      if (totalSessions !== null) {
        const oldValue = userStats.totalSessions;
        userStats.totalSessions = Math.max(0, userStats.totalSessions - totalSessions);
        changes.push(`Total Sessions: ${oldValue} → ${userStats.totalSessions} (-${totalSessions})`);
      }

      if (totalTimeToRemove > 0) {
        const oldValue = userStats.totalTime;
        userStats.totalTime = Math.max(0, userStats.totalTime - totalTimeToRemove);
        const removedHours = Math.floor(totalTimeToRemove / 60);
        const removedMinutes = totalTimeToRemove % 60;
        const oldHours = Math.floor(oldValue / 60);
        const oldMinutes = oldValue % 60;
        const newHours = Math.floor(userStats.totalTime / 60);
        const newMinutes = userStats.totalTime % 60;
        changes.push(`Total Time: ${oldHours}h ${oldMinutes}m → ${newHours}h ${newMinutes}m (-${removedHours}h ${removedMinutes}m)`);
      }

      if (weeklySessions !== null) {
        const oldValue = userStats.weeklySessions;
        userStats.weeklySessions = Math.max(0, userStats.weeklySessions - weeklySessions);
        changes.push(`Weekly Sessions: ${oldValue} → ${userStats.weeklySessions} (-${weeklySessions})`);
      }

      if (weeklyTimeToRemove > 0) {
        const oldValue = userStats.weeklyTime || 0;
        userStats.weeklyTime = Math.max(0, (userStats.weeklyTime || 0) - weeklyTimeToRemove);
        const removedHours = Math.floor(weeklyTimeToRemove / 60);
        const removedMinutes = weeklyTimeToRemove % 60;
        const oldHours = Math.floor(oldValue / 60);
        const oldMinutes = oldValue % 60;
        const newHours = Math.floor(userStats.weeklyTime / 60);
        const newMinutes = userStats.weeklyTime % 60;
        changes.push(`Weekly Time: ${oldHours}h ${oldMinutes}m → ${newHours}h ${newMinutes}m (-${removedHours}h ${removedMinutes}m)`);
      }

      if (activeFarms !== null) {
        const oldValue = userStats.activeFarms || 0;
        userStats.activeFarms = Math.max(0, (userStats.activeFarms || 0) - activeFarms);
        changes.push(`Active Farms: ${oldValue} → ${userStats.activeFarms} (-${activeFarms})`);
      }

      resultMessage = `Removed specific stats for ${targetUser}`;
    } else {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**❌ Invalid Action**\nPlease select a valid action.');
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Save updated data to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(resultColor)
      .setTitle('🗑️ Stats Removed Successfully')
      .setDescription(resultMessage)
      .addFields(
        { name: '👤 Target User', value: `${targetUser}`, inline: true },
        { name: '🔧 Action Performed', value: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), inline: true },
        { name: '👮 Executed By', value: `${interaction.user}`, inline: false }
      )
      .setTimestamp();

    // Add changes field if there are any specific changes
    if (changes.length > 0) {
      successEmbed.addFields({ name: '📝 Changes Made', value: changes.join('\n'), inline: false });
    }

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  },
};