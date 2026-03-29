
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItem, formatItemName } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('use')
		.setDescription('Envanterdeki eşyayı kullan.')
		.addStringOption(opt =>
			opt
				.setName('esya')
				.setDescription('Kullanmak istediğin eşya')
				.setRequired(true)
				.addChoices(
					{ name: '🧪 Can iksiri', value: 'Can iksiri' }
				)
		),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const itemName = interaction.options.getString('esya');
		const item = getItem(itemName);

		if (!item) {
			return interaction.reply({ content: 'Bu eşya kullanılabilir değil.', ephemeral: true });
		}

		const idx = player.inventory.indexOf(itemName);
		if (idx === -1) {
			return interaction.reply({ content: 'Bu eşya envanterinde yok.', ephemeral: true });
		}

		player.inventory.splice(idx, 1);

		if (item.effect.hp) {
			player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
		}

		setPlayer(interaction.user.id, player);
		const embed = new EmbedBuilder()
			.setTitle(`${itemName} kullanıldı!`)
			.setDescription(`Şu anki HP: ${player.hp}/${player.maxHp}`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
