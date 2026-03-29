const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItem, formatItemName } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('equip')
		.setDescription('Envanterdeki bir eşyayı kuşan.')
		.addStringOption(opt =>
			opt
				.setName('esya')
				.setDescription('Kuşanmak istediğin eşya')
				.setRequired(true)
				.addChoices(
					{ name: '🗡️ Küçük Kılıç', value: 'Küçük Kılıç' },
					{ name: '⚔️ Büyük Kılıç', value: 'Büyük Kılıç' },
					{ name: '🛡️ Derin Zırh', value: 'Derin Zırh' },
					{ name: '🐉 Ejderha Zırhı', value: 'Ejderha Zırhı' }
				)
		),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const itemName = interaction.options.getString('esya');
		const item = getItem(itemName);

		if (!item || (!item.effect.attack && !item.effect.defense)) {
			return interaction.reply({ content: 'Bu eşya kuşanılabilir değil.', ephemeral: true });
		}

		if (!player.inventory.includes(itemName)) {
			return interaction.reply({ content: 'Bu eşya envanterinde yok.', ephemeral: true });
		}

		player.equipment = player.equipment || {};
		if (item.effect.attack) player.equipment.weapon = itemName;
		if (item.effect.defense) player.equipment.armor = itemName;
		setPlayer(interaction.user.id, player);

		const path = require('path');
		const { EmbedBuilder } = require('discord.js');
		const embed = new EmbedBuilder()
			.setTitle(`${itemName} kuşandı!`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	},
};