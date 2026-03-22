require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN) {
	console.error('Missing DISCORD_TOKEN in .env');
	process.exit(1);
}

if (!CLIENT_ID) {
	console.error('Missing CLIENT_ID in .env');
	process.exit(1);
}

if (GUILD_ID && !/^[0-9]+$/.test(GUILD_ID)) {
	console.error('Invalid GUILD_ID in .env: must be a Discord snowflake (numeric).');
	process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Komutlar yükleniyor: ${commands.length}`);

		const route = GUILD_ID
			? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
			: Routes.applicationCommands(CLIENT_ID);

		await rest.put(route, { body: commands });

		console.log('Komutlar başarıyla yüklendi.');
		if (!GUILD_ID) {
			console.log('Not: Komutlar global olarak yüklendi; Discord ta görünmesi birkaç dakika sürebilir.');
		}
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();
