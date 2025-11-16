const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: [
    // /sethostroles
    new SlashCommandBuilder()
      .setName('sethostroles')
      .setDescription('Select one or more roles that count as hosts.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addRoleOption(option =>
        option.setName('role1').setDescription('First host role').setRequired(true)
      )
      .addRoleOption(option =>
        option.setName('role2').setDescription('Second host role (optional)').setRequired(false)
      )
      .addRoleOption(option =>
        option.setName('role3').setDescription('Third host role (optional)').setRequired(false)
      ),

    // /setreminderchannel
    new SlashCommandBuilder()
      .setName('setreminderchannel')
      .setDescription('Add or remove this channel from reminders.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(option =>
        option
          .setName('action')
          .setDescription('Choose to add, remove, or list reminder channels.')
          .setRequired(true)
          .addChoices(
            { name: 'Add this channel', value: 'add' },
            { name: 'Remove this channel', value: 'remove' },
            { name: 'List all reminder channels', value: 'list' },
          )
      ),

    // /set336roles
    new SlashCommandBuilder()
      .setName('set336roles')
      .setDescription('Set which roles are pinged for the 3-3-6 farm.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addRoleOption(option =>
        option.setName('role1').setDescription('First role').setRequired(true)
      )
      .addRoleOption(option =>
        option.setName('role2').setDescription('Second role (optional)').setRequired(false)
      )
      .addRoleOption(option =>
        option.setName('role3').setDescription('Third role (optional)').setRequired(false)
      ),
  ]
};
