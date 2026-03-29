const fs = require('node:fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItems, getItem, getItemName, formatItemName } = require('../game/items');

function resolveItemImage(item) {
	if (!item?.img) return null;
	const imagePath = path.resolve(__dirname, '..', item.img);
	return fs.existsSync(imagePath) ? imagePath : null;
}

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
						{ name: '🗡️ Küçük Kılıç', value: 'Küçük Kılıç' },
						{ name: '⚔️ Büyük Kılıç', value: 'Büyük Kılıç' },
						{ name: '🛡️ Derin Zırh', value: 'Derin Zırh' },
						{ name: '🐉 Ejderha Zırhı', value: 'Ejderha Zırhı' },
						{ name: '🧪 Can iksiri', value: 'Can iksiri' }
					)
				)
		)
		.addSubcommand(sub =>
			sub
				.setName('hizli-sat')
				.setDescription('Bir eşyayı hızlıca %50 fiyatla satar.')
				.addStringOption(opt =>
					opt.setName('esya').setDescription('Hızlı satmak istediğin eşya').setRequired(true).addChoices(
						{ name: '🗡️ Küçük Kılıç', value: 'Küçük Kılıç' },
						{ name: '⚔️ Büyük Kılıç', value: 'Büyük Kılıç' },
						{ name: '🛡️ Derin Zırh', value: 'Derin Zırh' },
						{ name: '🐉 Ejderha Zırhı', value: 'Ejderha Zırhı' },
						{ name: '🧪 Can iksiri', value: 'Can iksiri' }
					)
				)
		),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const sub = interaction.options.getSubcommand();

		if (sub === 'liste') {
			const list = getItems();
			const embeds = [];
			const files = [];
			Object.entries(list).forEach(([name, info], idx) => {
				const stats = info.effect ? Object.entries(info.effect).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ') : '';
				const embed = new EmbedBuilder()
					.setTitle(`${name} - ${info.price} altın`)
					.setDescription(`${info.description}${stats ? `\nEtki: ${stats}` : ''}`)
					.setFooter({ text: 'Satın almak için /shop satinal kullanın.' });
				if (info.img) {
					const imgPath = path.resolve(__dirname, '..', info.img);
					if (fs.existsSync(imgPath)) {
						const fileName = `shop_item_${idx}.png`;
						embed.setThumbnail(`attachment://${fileName}`);
						files.push({ attachment: imgPath, name: fileName });
					}
				}
				embeds.push(embed);
			});
			return interaction.reply({ embeds, files, ephemeral: true });
		}

		const itemName = interaction.options.getString('esya');
		const item = getItem(itemName);
		const itemKey = getItemName(itemName);
		if (!item) {
			return interaction.reply({ content: 'Bu eşya mağazada yok.', ephemeral: true });
		}

		if (sub === 'satinal') {
			// Envanter limiti kontrolü (kuşanılanlar hariç)
			if (Array.isArray(player.inventory) && player.inventory.length >= 10) {
				return interaction.reply({ content: 'Envanterin dolu! En fazla 10 eşya saklayabilirsin.', ephemeral: true });
			}
			if (player.gold < item.price) {
				return interaction.reply({ content: `Yeterli altının yok. ${item.price} gerekir.`, ephemeral: true });
			}
			player.gold -= item.price;
			player.inventory.push(itemKey || itemName);
			setPlayer(interaction.user.id, player);

			const embed = new EmbedBuilder()
				.setTitle(`${formatItemName(itemName)} satın alındı!`)
				.setDescription(`${item.description}\nKalan altın: ${player.gold}.`)
				.addFields({ name: 'Etki', value: item.effect ? Object.entries(item.effect).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ') : 'Yok' });

			if (item.img) {
				const imagePath = resolveItemImage(item);
				if (imagePath) {
					const tempName = 'item_image.png';
					embed.setImage(`attachment://${tempName}`);
					try {
						return await interaction.reply({
							embeds: [embed],
							files: [{ attachment: imagePath, name: tempName }],
							ephemeral: true,
						});
					} catch (err) {
						console.error('Görsel yüklenirken hata:', err);
						return interaction.reply({ embeds: [embed], ephemeral: true });
					}
				}
			}

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (sub === 'hizli-sat') {
			const usedItemName = getItemName(itemName) || itemName;
			const idx = player.inventory.indexOf(usedItemName);
			if (idx === -1) {
				return interaction.reply({ content: 'Bu eşyan yok envanterinde.', ephemeral: true });
			}
			player.inventory.splice(idx, 1);
			const rate = 0.5;
			const sellPrice = Math.floor(item.price * rate);
			player.gold += sellPrice;
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: `${formatItemName(itemName)} hızlıca satıldı. +${sellPrice} altın (şimdi ${player.gold}).`, ephemeral: true });
		}

		return interaction.reply({ content: 'Geçersiz alt komut.', ephemeral: true });
	},
};
