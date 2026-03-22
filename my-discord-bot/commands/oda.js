const { SlashCommandBuilder } = require('discord.js');
const { createRoom, getRoom, getRoomsByOwner, joinRoom } = require('../game/rooms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oda')
		.setDescription('MMORPG oda sistemi komutları')
		.addSubcommand(sub =>
			sub.setName('olustur')
				.setDescription('Kendine özel bir keşif/oda oluşturur')
				.addStringOption(opt =>
					opt.setName('isim')
						.setDescription('Odanın adı (opsiyonel)')
						.setRequired(false)))
		.addSubcommand(sub =>
			sub.setName('bilgi')
				.setDescription('Bir odanın bilgilerini gösterir')
				.addStringOption(opt =>
					opt.setName('odaid')
						.setDescription('Oda IDsi (yoksa tüm kendi odalarını listeler)')
						.setRequired(false)))
		.addSubcommand(sub =>
			sub.setName('katil')
				.setDescription('Bir odaya katılır')
				.addStringOption(opt =>
					opt.setName('odaid')
						.setDescription('Katılmak istediğin oda IDsi')
						.setRequired(true)))
		.addSubcommand(sub =>
			sub.setName('list')
				.setDescription('Kendi oluşturduğun odaların listesini gösterir')),

	async execute(interaction) {
		const userId = interaction.user.id;
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'olustur') {
			const name = interaction.options.getString('isim');
			const room = createRoom(userId, name);
			return interaction.reply({
				content: `✅ Oda oluşturuldu!
ID: ${room.id}
İsim: ${room.name}
Arazi: ${room.terrain}
Canavar: ${room.monster} (HP ${room.monsterHp}, ATK ${room.monsterAttack})
Hazine: ${room.treasure} (+${room.lootGold} altın)
`,
			});
		}

		if (subcommand === 'bilgi') {
			const roomId = interaction.options.getString('odaid');
			if (roomId) {
				const room = getRoom(roomId);
				if (!room) return interaction.reply({ content: '⚠️ Bu ID ile oda bulunamadı.', ephemeral: true });
				return interaction.reply({
					content: `📍 Oda Bilgisi
ID: ${room.id}
İsim: ${room.name}
Sahip: <@${room.owner}>
Oluşturulma: ${room.createdAt}
Arazi: ${room.terrain}
Canavar: ${room.monster} (HP ${room.monsterHp}, ATK ${room.monsterAttack})
Hazine: ${room.treasure} (+${room.lootGold} altın)
Oyuncular: ${room.players.map(p => `<@${p}>`).join(', ')}
`,
				});
			}

			const rooms = getRoomsByOwner(userId);
			if (!rooms.length) return interaction.reply({ content: '🛈 Henüz bir oda oluşturmadın.', ephemeral: true });
			return interaction.reply({
				content: '🏰 Kendi Odalarınız:\n' + rooms.map(r => `• ${r.name} (ID: ${r.id}, Canavar: ${r.monster}, Hazine: ${r.treasure})`).join('\n'),
				ephemeral: true,
			});
		}

		if (subcommand === 'katil') {
			const roomId = interaction.options.getString('odaid');
			const room = joinRoom(roomId, userId);
			if (!room) return interaction.reply({ content: '⚠️ Bu ID ile oda bulunamadı.', ephemeral: true });
			return interaction.reply({ content: `✅ <@${userId}> başarıyla ${room.name} odasına katıldı!` });
		}

		if (subcommand === 'list') {
			const rooms = getRoomsByOwner(userId);
			if (!rooms.length) return interaction.reply({ content: '🛈 Henüz bir oda oluşturmadın.', ephemeral: true });
			return interaction.reply({
				content: '📋 Kendi Odalarınız:\n' + rooms.map(r => `• ${r.name} (ID: ${r.id})`).join('\n'),
				ephemeral: true,
			});
		}
	},
};
