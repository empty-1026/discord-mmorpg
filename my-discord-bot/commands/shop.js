const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItems, getItem } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('MMORPG mağazası: listele/ satın al / sat')
		.addSubcommand(sub => sub.setName('liste').setDescription('Mağazadaki eşyaları gösterir.'))
		.addSubcommand(sub =>
			sub
				.setName('satinal')
				.setDescription('Bir eşya satın alır.')
				.addStringOption(opt =>
					opt.setName('esya').setDescription('Satın almak istediğin eşya').setRequired(true).addChoices(
						{ name: 'Küçük Kılıç', value: 'Küçük Kılıç' },
						{ name: 'Büyük Kılıç', value: 'Büyük Kılıç' },
						{ name: 'Derin Zırh', value: 'Derin Zırh' },
						{ name: 'Ejderha Zırhı', value: 'Ejderha Zırhı' },
						{ name: 'Can iksiri', value: 'Can iksiri' }
					)
				)
		)
		.addSubcommand(sub =>
			sub
				.setName('sat')
				.setDescription('Bir eşyayı satar.')
				.addStringOption(opt =>
					opt.setName('esya').setDescription('Satmak istediğin eşya').setRequired(true).addChoices(
						{ name: 'Küçük Kılıç', value: 'Küçük Kılıç' },
						{ name: 'Büyük Kılıç', value: 'Büyük Kılıç' },
						{ name: 'Derin Zırh', value: 'Derin Zırh' },
						{ name: 'Ejderha Zırhı', value: 'Ejderha Zırhı' },
						{ name: 'Can iksiri', value: 'Can iksiri' }
					)
				)
		),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const sub = interaction.options.getSubcommand();

		if (sub === 'liste') {
			const list = getItems();
			const lines = Object.entries(list).map(([name, info]) => `${name} - ${info.price} altın - ${info.description}`);
			return interaction.reply({ content: `🛒 Mağaza:
${lines.join('\n')}`, ephemeral: true });
		}

		const itemName = interaction.options.getString('esya');
		const item = getItem(itemName);
		if (!item) {
			return interaction.reply({ content: 'Bu eşya mağazada yok.', ephemeral: true });
		}

		if (sub === 'satinal') {
			if (player.gold < item.price) {
				return interaction.reply({ content: `Yeterli altının yok. ${item.price} gerekir.`, ephemeral: true });
			}
			player.gold -= item.price;
			player.inventory.push(itemName);
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: `${itemName} satın alındı! Kalan altın: ${player.gold}.`, ephemeral: true });
		}

		if (sub === 'sat') {
			const idx = player.inventory.indexOf(itemName);
			if (idx === -1) {
				return interaction.reply({ content: 'Bu eşyan yok envanterinde.', ephemeral: true });
			}
			player.inventory.splice(idx, 1);
			const sellPrice = Math.floor(item.price * 0.6);
			player.gold += sellPrice;
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: `${itemName} satıldı. +${sellPrice} altın (şimdi ${player.gold}).`, ephemeral: true });
		}

		return interaction.reply({ content: 'Geçersiz alt komut.', ephemeral: true });
	},
};
