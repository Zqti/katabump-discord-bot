const { SlashCommandBuilder } = require('@discordjs/builders');
const { handleLogCommand } = require('./logCommands');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setearlyfarmlog')
    .setDescription('Set the log channel for early ended farms.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the channel to use for early end logs')
        .setRequired(true)),
  async execute(interaction) {
    await handleLogCommand(interaction, interaction.client.logChannels, interaction.client.saveData);
  }
};