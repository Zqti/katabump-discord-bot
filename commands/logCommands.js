const { EmbedBuilder } = require('discord.js');

async function handleLogCommand(interaction, logChannels, saveData) {
  const channel = interaction.options.getChannel('channel');

  if (!interaction.member.roles.cache.some(r => ['Host', 'Staff'].includes(r.name)) && !interaction.member.permissions.has('Administrator')) {
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setDescription('**You need Staff, Host, or Admin role to set log channels.**')],
      ephemeral: true
    });
  }

  const commandName = interaction.commandName;

  if (commandName === 'setfullfarmlog') {
    logChannels.fullFarm = channel.id;
    saveData();
    return interaction.reply({ content: `**Full Farm log channel set to <#${channel.id}>**`, ephemeral: true });
  }

  if (commandName === 'setearlyfarmlog') {
    logChannels.earlyEnd = channel.id;
    saveData();
    return interaction.reply({ content: `**Early End log channel set to <#${channel.id}>**`, ephemeral: true });
  }

  if (commandName === 'setlordbanlog') {
    logChannels.lordBan = channel.id;
    saveData();
    return interaction.reply({ content: `**Lord Ban log channel set to <#${channel.id}>**`, ephemeral: true });
  }
}

module.exports = {
  handleLogCommand
};