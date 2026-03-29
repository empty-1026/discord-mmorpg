const { SlashCommandBuilder } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');
const { createHpBar } = require('../utils/hpBar');

function createBoss(playerLevel) {
	if (playerLevel < 5) {
		return { name: 'Kobold Lord', hp: 80, attack: 14, defense: 4, xp: 70, gold: 60 };
	} else if (playerLevel < 10) {
		return { name: 'Ork Şefi', hp: 140, attack: 22, defense: 7, xp: 150, gold: 130 };
	} else {
		return { name: 'Ejderha', hp: 260, attack: 32, defense: 12, xp: 350, gold: 300 };
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boss')
		.setDescription('Seviyene göre bossla dövüş.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const boss = createBoss(player.level);

		const bossBar = createHpBar(boss.hp, boss.hp);
		let log = `🔥 Boss savaşı: ${boss.name} (Lv ${player.level})\n**${boss.name}:** ${bossBar} ${boss.hp}/${boss.hp}\n\n`;

const equipment = player.equipment || { weapon: null, armor: null };
	const setBonus = {
		attack: 0,
		defense: 0,
	};

	let equipmentAttack = 0;
	let equipmentDefense = 0;
	if (equipment.weapon === 'Küçük Kılıç') equipmentAttack += 3;
	if (equipment.weapon === 'Büyük Kılıç') equipmentAttack += 8;
	if (equipment.armor === 'Derin Zırh') equipmentDefense += 4;
	if (equipment.armor === 'Ejderha Zırhı') equipmentDefense += 10;

	if (equipment.weapon && equipment.armor) {
		if (equipment.weapon === 'Büyük Kılıç' && equipment.armor === 'Ejderha Zırhı') {
			setBonus.attack += 5;
			setBonus.defense += 5;
		} else if (equipment.weapon === 'Küçük Kılıç' && equipment.armor === 'Derin Zırh') {
			setBonus.attack += 2;
			setBonus.defense += 2;
		}
	}

	const levelDamageBoost = Math.floor(player.level / 2);
	const levelDefenseBoost = Math.floor(player.level / 3);

	const playerEffectiveAttack = player.attack + equipmentAttack + setBonus.attack + levelDamageBoost;
	const playerEffectiveDefense = player.defense + equipmentDefense + setBonus.defense + levelDefenseBoost;

		let pHp = Math.min(player.hp, player.maxHp);
		let bHp = boss.hp;

		let round = 1;
		while (pHp > 0 && bHp > 0 && round <= 12) {
			const pDmg = Math.max(1, playerEffectiveAttack - boss.defense);
			bHp -= pDmg;
			const bossBossBar = createHpBar(Math.max(0, bHp), boss.hp);
			log += `🌟 Runde ${round}: Sen ${pDmg} vurdun\n**${boss.name}:** ${bossBossBar} ${Math.max(0, bHp)}/${boss.hp}\n`;
			if (bHp <= 0) break;

			const bossScale = 1 + (player.level >= 10 ? 0.25 : player.level >= 5 ? 0.15 : 0.08);
			const rawBossAttack = boss.attack + Math.floor(boss.hp / 40);
			const bDmg = Math.max(1, Math.floor(rawBossAttack * bossScale) - playerEffectiveDefense);
			pHp -= bDmg;
			const playerBar = createHpBar(Math.max(0, pHp), player.maxHp);
			log += `💥 Boss ${bDmg} vurdu (x${bossScale.toFixed(2)})\n**Senin HP:** ${playerBar} ${Math.max(0, pHp)}/${player.maxHp}\n`;
			round += 1;
		}

		if (pHp > 0 && bHp <= 0) {
			player.xp += boss.xp;
			player.gold += boss.gold;
			player.hp = pHp;
			log += `🏆 Boss yenildi! +${boss.xp} XP +${boss.gold} altın\n`;

			while (player.xp >= player.level * 100) {
				player.xp -= player.level * 100;
				player.level += 1;
				player.maxHp += 25;
				player.hp = player.maxHp;
				player.attack += 3;
				player.defense += 2;
				log += `🎉 Seviye atladın! Şimdi Lv ${player.level}\n`;
			}

			setPlayer(interaction.user.id, player);
			const { EmbedBuilder } = require('discord.js');
			const embed = new EmbedBuilder()
				.setTitle('Boss Savaşı Sonucu')
				.setDescription(log);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (pHp <= 0) {
			player.hp = Math.max(1, Math.floor(player.maxHp * 0.2));
			setPlayer(interaction.user.id, player);
			return interaction.reply({ content: `${log}💀 Yenildin. Canin 20% ile yeniden ayarlandı.`, ephemeral: true });
		}

		player.hp = pHp;
		setPlayer(interaction.user.id, player);
		return interaction.reply({ content: `${log}⏳ Berabere! Bir sonraki denemeye hazır ol.`, ephemeral: true });
	},
};