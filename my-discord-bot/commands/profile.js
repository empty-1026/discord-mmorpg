const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../game/players');
const { createHpBar } = require('../utils/hpBar');
const { formatItemName } = require('../game/items');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('MMORPG karakter profilini gösterir.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const hpBar = createHpBar(player.hp, player.maxHp);

		// Ekipmanlar: sadece isim
		let equipmentDisplay = '';
		if (player.equipment?.weapon) equipmentDisplay += `${player.equipment.weapon}\n`;
		if (player.equipment?.armor) equipmentDisplay += `${player.equipment.armor}\n`;

		// Envanter: sadece isim
		let inventoryDisplay = '';
		if (player.inventory.length > 0) {
			inventoryDisplay = player.inventory.join(' ');
		} else {
			inventoryDisplay = 'Yok';
		}

		// Düz metin profil çıktısı
		const text =
			`**${interaction.user.username} | ${player.level}. Seviye**\n` +
			`${equipmentDisplay}` +
			`❤️ ${player.hp}/${player.maxHp}   🪙 ${player.gold}   ⚔️ ${player.attack}   🛡️ ${player.defense}\n` +
			`🎒 Envanter: ${inventoryDisplay}`;

		await interaction.reply({ content: text, flags: 64 });
	},
};