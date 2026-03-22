const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yardim')
		.setDescription('Mevcut komutları listeler.'),

	async execute(interaction) {
		await interaction.reply({
			content: [
				'Komutlar:',
				'- /ping',
				'- /avatar [kullanici]',
				'- /yardim',
				'- /profile',
				'- /explore',
				'- /boss',
				'- /shop liste',
				'- /shop satinal <esya>',
				'- /shop sat <esya>',
				'- /inventory',
				'- /use <esya>',
				'- /equip <esya>',
			].join('\n'),
			ephemeral: true,
		});
	},
};