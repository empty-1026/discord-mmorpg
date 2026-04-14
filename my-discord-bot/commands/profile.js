const { SlashCommandBuilder, EmbedBuilder, Attachment } = require('discord.js');
const { getPlayer } = require('../game/players');
const { createHpBar } = require('../utils/hpBar');
const { formatItemName } = require('../game/items');
const inventory = require('./inventory');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('MMORPG karakter profilini gösterir.'),

	async execute(interaction) {
		const player = getPlayer(interaction.user.id);
		const hpBar = createHpBar(player.hp, player.maxHp);
const weapontext = player.equipment?.armor
?player.inventory.map(item=>formatItemName(item)).join('/n')
:'yok';
const embed = new EmbedBuilder()
.setTitle('${interaction.user.username} | Seviye ${player.level}.')
.setDescription(
	'HP:${player.hp}/${player.maxHp}\n + ${hpBar}\n' + 'altın: ${player.gold}\n' + 'saldırı: ${player.attack}\n' + 'savunma: ${player.defense}\n' +
)
.addFields(
	{name:'kuşanılan silah', value:weapontext, inline:true},
	{name:'kuşanılan zırh', value:armortext, inline:true},
	{name:'Envanter', value:inventorytext, inline:false},
)
const previewitem = player.equipment?.weapon || player.equipment?.armor;
const imagepath=previewitem ? getitemimagepath(previewitem) : null;

if (imagepath) 
	{embed.setThumbnail('attachment://profile_preview.png');
		return interaction.reply({
			embeds:[embed],
			files:[{Attachment: imagepath, name:'profile_item.png'}],
			ephemeral:true,
		});
	}
	return interaction.reply({
		embeds:[embed],
		ephemeral:true,
	});
},
};



// })
// // Ekipmanlar: sadece isim
// let equipmentDisplay = '';
// if (player.equipment?.weapon) equipmentDisplay += `${player.equipment.weapon}\n`;
// if (player.equipment?.armor) equipmentDisplay += `${player.equipment.armor}\n`;

// // Envanter: sadece isim
// let inventoryDisplay = '';
// if (player.inventory.length > 0) {
// 	inventoryDisplay = player.inventory.join(' ');
// } else {
// 	inventoryDisplay = 'Yok';
// }

// // Düz metin profil çıktısı
// const text =
// 	`**${interaction.user.username} | ${player.level}. Seviye**\n` +
// 	`${equipmentDisplay}` +
// 	`❤️ ${player.hp}/${player.maxHp}   🪙 ${player.gold}   ⚔️ ${player.attack}   🛡️ ${player.defense}\n` +
// 	`🎒 Envanter: ${inventoryDisplay}`;

// await interaction.reply({ content: text, flags: 64 });