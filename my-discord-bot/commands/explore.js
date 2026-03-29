const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { formatHpDisplay } = require('../utils/hpBar');

// Define available mobs for explore
const EXPLORE_MOBS = [
	{ name: 'Kobold', hp: 30, maxHp: 30, attack: 8, defense: 2, xp: 25, gold: 15 },
	{ name: 'Fare', hp: 15, maxHp: 15, attack: 4, defense: 1, xp: 10, gold: 5 },
	{ name: 'Canavar Ağaçkakan', hp: 35, maxHp: 35, attack: 10, defense: 1, xp: 30, gold: 20 },
	{ name: 'Zombi', hp: 45, maxHp: 45, attack: 6, defense: 3, xp: 35, gold: 25 },
	{ name: 'Cadı', hp: 40, maxHp: 40, attack: 12, defense: 2, xp: 40, gold: 30 },
	{ name: 'Hayalet', hp: 25, maxHp: 25, attack: 9, defense: 1, xp: 28, gold: 18 },
	{ name: 'Dev Sincap', hp: 50, maxHp: 50, attack: 7, defense: 4, xp: 45, gold: 35 },
	{ name: 'Ormandaki Cöcük', hp: 55, maxHp: 55, attack: 11, defense: 5, xp: 50, gold: 40 },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Keşfe çık ve canavarlarla savaş.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		// Select random mob
		const mobTemplate = EXPLORE_MOBS[Math.floor(Math.random() * EXPLORE_MOBS.length)];
		const monster = {
			name: mobTemplate.name,
			hp: mobTemplate.hp,
			maxHp: mobTemplate.maxHp,
			attack: mobTemplate.attack,
			defense: mobTemplate.defense,
			xp: mobTemplate.xp,
			gold: mobTemplate.gold,
		};

		let log = `🌲 Keşif başladı! ${monster.name} ile karşılaştın.\n\n`;
		log += `**Düşman:**\n${formatHpDisplay(monster.hp, monster.maxHp)}\n\n`;

		const playerDamage = Math.max(1, player.attack - monster.defense);
		monster.hp -= playerDamage;
		log += `🗡️ Sen vurduğun hasar: ${playerDamage}\n${formatHpDisplay(monster.hp, monster.maxHp)}\n\n`;

		if (monster.hp <= 0) {
			player.xp += monster.xp;
			player.gold += monster.gold;
			log += `🏆 Canavarı yendin! +${monster.xp} XP, +${monster.gold} altın.\n`;

			// --- LOOT SİSTEMİ ---
			// Rastgele 5-25 altın ek olarak ver
			const lootGold = Math.floor(Math.random() * 21) + 5;
			player.gold += lootGold;
			log += `💰 Ekstra loot: +${lootGold} altın\n`;

			// Rastgele item ver (envanterde yer varsa)
			const { getItems, formatItemName } = require('../game/items');
			const items = Object.keys(getItems());
			let lootItem = null;
			if (Array.isArray(player.inventory) && player.inventory.length < 10) {
				lootItem = items[Math.floor(Math.random() * items.length)];
				player.inventory.push(lootItem);
				log += `🎁 Loot: ${formatItemName(lootItem)} envanterine eklendi!\n`;
			} else {
				log += '🎁 Loot: Envanterin dolu olduğu için eşya alamadın!\n';
			}

			while (player.xp >= player.level * 100) {
				player.xp -= player.level * 100;
				player.level += 1;
				player.maxHp += 20;
				player.hp = player.maxHp;
				player.attack += 2;
				player.defense += 1;
				log += `✨ Seviye atladın! Yeni seviye: ${player.level}\n`;
			}

			setPlayer(interaction.user.id, player);
			const { EmbedBuilder } = require('discord.js');
			const path = require('path');
			const embed = new EmbedBuilder()
				.setTitle('Keşif Sonucu')
				.setDescription(log);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const monsterDamage = Math.max(1, monster.attack - player.defense);
		player.hp -= monsterDamage;
		log += `👹 ${monster.name} vurdu: ${monsterDamage}.\n**Seninle:**\n${formatHpDisplay(player.hp, player.maxHp)}\n\n`;

		if (player.hp <= 0) {
			player.hp = Math.max(1, player.maxHp);
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: log + '💀 Yenildin! Canin kısmen yeniden doldu.' });
		}

		setPlayer(interaction.user.id, player);
		log += `💪 Savaştan sağ çıktın.\n**Seninle:**\n${formatHpDisplay(player.hp, player.maxHp)}`;
		return interaction.reply({ content: log });
	},
};