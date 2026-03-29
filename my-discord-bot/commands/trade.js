const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { getItem, formatItemName } = require('../game/items');
const { createTrade, getTrade, setTrade } = require('../game/trades');

function removeFromInventory(player, itemName) {
	const idx = player.inventory.indexOf(itemName);
	if (idx === -1) return false;
	player.inventory.splice(idx, 1);
	return true;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('Eşya/altın takas teklifi gönder ve kabul et.')
		.addSubcommand(sub =>
			sub
				.setName('teklif')
				.setDescription('Başka bir kullanıcıya takas teklifi gönderir.')
				.addUserOption(opt => opt.setName('hedef').setDescription('Teklifi göndereceğin kullanıcı').setRequired(true))
				.addStringOption(opt => opt.setName('teklif_esya').setDescription('Teklif edeceğin eşya adı').addChoices(
					{ name: '🗡️ Küçük Kılıç', value: 'Küçük Kılıç' },
					{ name: '⚔️ Büyük Kılıç', value: 'Büyük Kılıç' },
					{ name: '🛡️ Derin Zırh', value: 'Derin Zırh' },
					{ name: '🐉 Ejderha Zırhı', value: 'Ejderha Zırhı' },
					{ name: '🧪 Can iksiri', value: 'Can iksiri' }
				))
				.addIntegerOption(opt => opt.setName('teklif_altin').setDescription('Teklif edeceğin altın miktarı, 0 ise boş bırak.'))
				.addStringOption(opt => opt.setName('istek_esya').setDescription('İstediğin eşya adı').addChoices(
					{ name: '🗡️ Küçük Kılıç', value: 'Küçük Kılıç' },
					{ name: '⚔️ Büyük Kılıç', value: 'Büyük Kılıç' },
					{ name: '🛡️ Derin Zırh', value: 'Derin Zırh' },
					{ name: '🐉 Ejderha Zırhı', value: 'Ejderha Zırhı' },
					{ name: '🧪 Can iksiri', value: 'Can iksiri' }
				))
				.addIntegerOption(opt => opt.setName('istek_altin').setDescription('İstediğin altın miktarı, 0 ise boş bırak.'))
		)
		.addSubcommand(sub =>
			sub
				.setName('kabul')
				.setDescription('Size gelen takas teklifini kabul eder.')
				.addStringOption(opt => opt.setName('teklif_id').setDescription('Kabul etmek istediğin teklif IDsi').setRequired(true))
		)
		.addSubcommand(sub =>
			sub
				.setName('iptal')
				.setDescription('Kendi gönderdiğin teklifi iptal eder.')
				.addStringOption(opt => opt.setName('teklif_id').setDescription('İptal etmek istediğin teklif IDsi').setRequired(true))
		),

	async execute(interaction) {
		const sub = interaction.options.getSubcommand();

		if (sub === 'teklif') {
			const from = interaction.user;
			const to = interaction.options.getUser('hedef');
			if (to.id === from.id) {
				return interaction.reply({ content: 'Kendine takas teklif edemezsin.', ephemeral: true });
			}

			const offerItem = interaction.options.getString('teklif_esya');
			const offerGold = interaction.options.getInteger('teklif_altin') || 0;
			const requestItem = interaction.options.getString('istek_esya');
			const requestGold = interaction.options.getInteger('istek_altin') || 0;

			if (!offerItem && offerGold <= 0) {
				return interaction.reply({ content: 'Teklif kısmı için eşya veya altın belirtmelisin.', ephemeral: true });
			}
			if (!requestItem && requestGold <= 0) {
				return interaction.reply({ content: 'İstek kısmı için eşya veya altın belirtmelisin.', ephemeral: true });
			}

			const sender = getPlayer(from.id);
			if (offerGold > sender.gold) {
				return interaction.reply({ content: `Bu kadar altının yok. Mevcut: ${sender.gold}.`, ephemeral: true });
			}
			if (offerItem && !sender.inventory.includes(offerItem)) {
				return interaction.reply({ content: `Envanterinde ${offerItem} bulunmuyor.`, ephemeral: true });
			}

			if (offerItem) {
				const item = getItem(offerItem);
				if (!item) return interaction.reply({ content: 'Geçersiz teklif eşyası.', ephemeral: true });
			}
			if (requestItem) {
				const item = getItem(requestItem);
				if (!item) return interaction.reply({ content: 'Geçersiz istek eşyası.', ephemeral: true });
			}

			const tradeId = `T${Date.now()}_${Math.floor(Math.random() * 10000)}`;
			createTrade({
				id: tradeId,
				from: from.id,
				to: to.id,
				offer: { item: offerItem || null, gold: offerGold },
				request: { item: requestItem || null, gold: requestGold },
			});

			const { EmbedBuilder } = require('discord.js');
			const embed = new EmbedBuilder()
				.setTitle('Takas Teklifi Gönderildi')
				.setDescription(`Teklif ID: ${tradeId}`);
			await interaction.reply({ embeds: [embed], ephemeral: true });

			await interaction.channel.send(
				`<@${to.id}>, <@${from.id}> sana takas teklifi gönderdi! ID: ${tradeId} - Teklif: ${offerItem ? formatItemName(offerItem) : ''}${offerGold > 0 ? ` +${offerGold} altın` : ''} -> ${requestItem ? formatItemName(requestItem) : ''}${requestGold > 0 ? ` +${requestGold} altın` : ''}`
			);

			return;

		}

		if (sub === 'kabul') {
			const tradeId = interaction.options.getString('teklif_id');
			const trade = getTrade(tradeId);
			if (!trade) {
				return interaction.reply({ content: 'Teklif bulunamadı.', ephemeral: true });
			}
			if (trade.status !== 'pending') {
				return interaction.reply({ content: `Teklif zaten ${trade.status}.`, ephemeral: true });
			}
			if (trade.to !== interaction.user.id) {
				return interaction.reply({ content: 'Bu teklifi kabul etme yetkin yok.', ephemeral: true });
			}

			const sender = getPlayer(trade.from);
			const receiver = getPlayer(trade.to);

			if (trade.offer.gold > sender.gold) return interaction.reply({ content: 'Teklifi gönderenin yeterli altını yok.', ephemeral: true });
			if (trade.request.gold > receiver.gold) return interaction.reply({ content: 'Senin yeterli altının yok.', ephemeral: true });
			if (trade.offer.item && !sender.inventory.includes(trade.offer.item)) return interaction.reply({ content: `Gönderenin envanterinde ${trade.offer.item} yok.`, ephemeral: true });
			if (trade.request.item && !receiver.inventory.includes(trade.request.item)) return interaction.reply({ content: `Senin envanterinde ${trade.request.item} yok.`, ephemeral: true });

			// Uygula
			sender.gold -= trade.offer.gold;
			receiver.gold += trade.offer.gold;
			receiver.gold -= trade.request.gold;
			sender.gold += trade.request.gold;

			if (trade.offer.item) {
				removeFromInventory(sender, trade.offer.item);
				receiver.inventory.push(trade.offer.item);
			}
			if (trade.request.item) {
				removeFromInventory(receiver, trade.request.item);
				sender.inventory.push(trade.request.item);
			}

			setPlayer(trade.from, sender);
			setPlayer(trade.to, receiver);

			trade.status = 'accepted';
			trade.acceptedAt = Date.now();
			setTrade(tradeId, trade);

			await interaction.reply({ content: `Takas kabul edildi! (${tradeId})`, ephemeral: true });
			await interaction.channel.send(`<@${trade.from}> ve <@${trade.to}> takas tamamlandı! (ID: ${tradeId})`);
			return;
		}

		if (sub === 'iptal') {
			const tradeId = interaction.options.getString('teklif_id');
			const trade = getTrade(tradeId);
			if (!trade) {
				return interaction.reply({ content: 'Teklif bulunamadı.', ephemeral: true });
			}
			if (trade.from !== interaction.user.id) {
				return interaction.reply({ content: 'Sadece kendi teklifini iptal edebilirsin.', ephemeral: true });
			}
			if (trade.status !== 'pending') {
				return interaction.reply({ content: `Teklif zaten ${trade.status}.`, ephemeral: true });
			}
			trade.status = 'cancelled';
			trade.cancelledAt = Date.now();
			setTrade(tradeId, trade);
			return interaction.reply({ content: `Teklif iptal edildi: ${tradeId}`, ephemeral: true });
		}

		return interaction.reply({ content: 'Geçersiz alt komut.', ephemeral: true });
	},
};