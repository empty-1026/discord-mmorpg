const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItem } = require('../game/items');

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
					{ name: 'Can Pojesyonu', value: 'Can Pojesyonu' }
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
		return interaction.reply({
			content: `${itemName} kullanıldı! Şu anki HP: ${player.hp}/${player.maxHp}`,
			ephemeral: true,
		});
	},
};