#!/bin/bash

echo "🤖 Discord Bot Setup Script"
echo "=============================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit /app/bot/.env and add your Discord token"
    echo ""
    echo "Get your token from: https://discord.com/developers/applications"
    echo ""
    exit 1
fi

# Check if token is configured
if grep -q "your_discord_bot_token_here" .env; then
    echo "❌ Please configure your Discord token in .env file"
    echo ""
    echo "Edit the file: /app/bot/.env"
    echo "Replace 'your_discord_bot_token_here' with your actual Discord bot token"
    echo ""
    echo "Get your token from: https://discord.com/developers/applications"
    exit 1
fi

echo "✅ Discord token configured"
echo ""
echo "🚀 Deploying slash commands..."
node deploy-commands.js

echo ""
echo "🔄 Reloading supervisor..."
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart bot

echo ""
echo "✅ Bot setup complete!"
echo ""
echo "📊 Check bot status: sudo supervisorctl status bot"
echo "📋 View bot logs: tail -f /var/log/supervisor/bot.out.log"
echo "❌ View bot errors: tail -f /var/log/supervisor/bot.err.log"
