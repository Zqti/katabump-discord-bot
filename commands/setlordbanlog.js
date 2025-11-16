const { SlashCommandBuilder } = require('@discordjs/builders');
const { handleLogCommand } = require('./logCommands');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlordbanlog')
    .setDescription('Set the log channel for lord ban actions.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the channel to use for lord ban logs')
        .setRequired(true)),
  async execute(interaction) {
    await handleLogCommand(interaction, interaction.client.logChannels, interaction.client.saveData);
  }
};