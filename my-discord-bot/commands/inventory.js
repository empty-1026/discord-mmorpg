const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer } = require('../game/players');
const { getItem, getItemName, formatItemName } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Envanterini gösterir.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		if (!player.inventory.length) {
			return interaction.reply({ content: 'Envanterin boş.', ephemeral: true });
		}


		// Her eşya için ayrı embed oluştur, görsel varsa embed image olarak ekle
		const embeds = [];
		const files = [];
		const maxItems = 10;
		player.inventory.slice(0, maxItems).forEach((name, index) => {
			const item = getItem(name);
			if (!item) return;
			const stats = [];
			if (item.effect.attack) stats.push(`+${item.effect.attack} ATK`);
			if (item.effect.defense) stats.push(`+${item.effect.defense} DEF`);
			if (item.effect.hp) stats.push(`+${item.effect.hp} HP`);
			const statsText = stats.length ? ` (${stats.join(", ")})` : '';
			const itemKey = getItemName(name);
			const embed = new EmbedBuilder()
				.setTitle(`${itemKey}${statsText}`)
				.setFooter({ text: `Seviye: ${player.level} | Altın: ${player.gold}` });
			embeds.push(embed);
		});

		// Eğer envanterde hiç eşya yoksa
		if (embeds.length === 0) {
			return interaction.reply({ content: 'Envanterin boş.', ephemeral: true });
		}

		return interaction.reply({ embeds, files, ephemeral: true });
	},
};