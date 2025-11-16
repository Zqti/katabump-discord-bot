require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load all command files
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command) {
    // Check if data is an array (for multiple commands in one file)
    if (Array.isArray(command.data)) {
      command.data.forEach(cmd => {
        commands.push(cmd.toJSON());
        console.log(`✅ Loaded command: ${cmd.name}`);
      });
    } else {
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`\n🚀 Started refreshing ${commands.length} application (/) commands.`);

    // Get application ID
    const application = await rest.get(Routes.oauth2CurrentApplication());
    const clientId = application.id;

    console.log(`📋 Application ID: ${clientId}`);

    // Deploy globally (will take up to 1 hour to propagate)
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log(`\n✅ Successfully reloaded ${data.length} application (/) commands globally.`);
    console.log('\n⏰ Note: Global commands may take up to 1 hour to appear in Discord.');
    console.log('💡 Tip: For instant testing, use guild-specific commands instead.\n');

  } catch (error) {
    console.error('\n❌ Error deploying commands:', error);
    
    if (error.code === 'TOKEN_INVALID') {
      console.log('\n🔑 Your Discord token is invalid. Please check your .env file.');
    } else if (error.message.includes('Missing Access')) {
      console.log('\n🔐 Bot doesn\'t have permission. Make sure it\'s invited with applications.commands scope.');
    }
  }
})();