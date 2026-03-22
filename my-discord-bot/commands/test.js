const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test komutu. Bot çalışıyor mu kontrol eder.'),

	async execute(interaction) {
		await interaction.reply({ content: 'Test OK ✅', ephemeral: true });
	},
};