const { SlashCommandBuilder } = require('@discordjs/builders');
const { handleLogCommand } = require('./logCommands');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setfullfarmlog')
    .setDescription('Set the log channel for full farm sessions.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the channel to use for full farm logs')
        .setRequired(true)),
  async execute(interaction) {
    await handleLogCommand(interaction, interaction.client.logChannels, interaction.client.saveData);
  }
};