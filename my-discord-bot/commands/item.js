const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getItem } = require('../game/items');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('İtem gösterir')
    .addStringOption(option =>
      option
      .setName('isim')
        .setDescription('Gösterilecek itemin adı')
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString('isim');
    const item = getItem(itemName);

    if (!item) {
      await interaction.reply({ content: 'Böyle bir item yok.', ephemeral: true });
    }

    const stats = [];
    if (item.effect.attack) stats.push(`+${item.effect.attack} ATK`);
    if (item.effect.defense) stats.push(`+${item.effect.defense} DEF`);
    if (item.effect.hp) stats.push(`+${item.effect.hp} HP`);

const embed = new EmbedBuilder()\
.settitle(formatitemname(itemName)
.setDescription(item.description || 'Açıklama yok.')
.addFields({
name: 'Etki',
value: stats.length ? stats.join(', ') : 'Yok', 
}));


//     // Sadece assets klasöründe dosyası olan itemler için embed oluştur
//     const embed = new EmbedBuilder()
//       .setTitle(`${itemName}`)
//       .setDescription(item.description);
//     await interaction.reply({ embeds: [embed], ephemeral: true });
//   },
// };
