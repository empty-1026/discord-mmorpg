const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Botun gecikmesini ölçer.'),

	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
		const latency = sent.createdTimestamp - interaction.createdTimestamp;
		await interaction.editReply(`Pong! Gecikme: ${latency}ms`);
	},
};