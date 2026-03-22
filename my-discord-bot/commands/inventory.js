const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../game/players');
const { getItem } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Envanterini gösterir.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		if (!player.inventory.length) {
			return interaction.reply({ content: 'Envanterin boş.', ephemeral: true });
		}

		const lines = player.inventory.map((name, index) => {
			const item = getItem(name);
			const stats = item ? `(+${item.effect.attack || 0} ATK, +${item.effect.defense || 0} DEF, +${item.effect.hp || 0} HP)` : '';
			return `${index + 1}. ${name} ${stats}`;
		});

		return interaction.reply({
			content: `🎒 ${interaction.user.username} envanteri:\n${lines.join('\n')}\n\nSeviye: ${player.level}, Altın: ${player.gold}`,
			ephemeral: true,
		});
	},
};