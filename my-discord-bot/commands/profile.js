const { SlashCommandBuilder } = require('discord.js');
const { getPlayer } = require('../game/players');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('MMORPG karakter profilini gösterir.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		await interaction.reply({
			content: `🧙 ${interaction.user.username}\n
Seviye: ${player.level}\nXP: ${player.xp}/${player.level * 100}\nHP: ${player.hp}/${player.maxHp}\nSaldırı: ${player.attack}\nSavunma: ${player.defense}\nAltın: ${player.gold}\nEnvanter: ${player.inventory.length} eşya\nSilah: ${player.equipment?.weapon || 'Yok'}\nZırh: ${player.equipment?.armor || 'Yok'}`,
			ephemeral: true,
		});
	},
};