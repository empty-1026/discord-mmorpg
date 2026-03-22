const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Keşfe çık ve canavarlarla savaş.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const monster = {
			name: 'Kobold',
			hp: 30,
			attack: 8,
			defense: 2,
			xp: 25,
			gold: 15,
		};

		let log = `🌲 Keşif başladı! ${monster.name} ile karşılaştın.\n`;

		const playerDamage = Math.max(1, player.attack - monster.defense);
		monster.hp -= playerDamage;
		log += `🗡️ Sen vurduğun hasar: ${playerDamage}\n`;

		if (monster.hp <= 0) {
			player.xp += monster.xp;
			player.gold += monster.gold;
			log += `🏆 Canavarı yendin! +${monster.xp} XP, +${monster.gold} altın.\n`;

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
			return interaction.reply({ content: log });
		}

		const monsterDamage = Math.max(1, monster.attack - player.defense);
		player.hp -= monsterDamage;
		log += `👹 ${monster.name} vurdu: ${monsterDamage}.\n`;

		if (player.hp <= 0) {
			player.hp = Math.max(1, player.maxHp);
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: log + '💀 Yenildin! Canin kısmen yeniden doldu.' });
		}

		setPlayer(interaction.user.id, player);
		log += `💪 Savaştan sağ çıktın. Şimdiki HP: ${player.hp}/${player.maxHp}`;
		return interaction.reply({ content: log });
	},
};