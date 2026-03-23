const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getPlayer, setPlayer } = require('../game/players');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Yönetici paneli: oyuncuların gold miktarını düzenle.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('gold')
				.setDescription('Belirtilen oyuncunun gold miktarını ekler, siler veya ayarlar.')
				.addStringOption(option =>
					option
						.setName('action')
						.setDescription('Yapılacak işlem')
						.setRequired(true)
						.addChoices(
							{ name: 'ekle', value: 'add' },
							{ name: 'sil', value: 'remove' },
							{ name: 'ayarla', value: 'set' }
						)
				)
				.addUserOption(option =>
					option
						.setName('hedef')
						.setDescription('Gold yönetilecek kullanıcı')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('miktar')
						.setDescription('Gold miktarı (pozitif tam sayı)')
						.setRequired(true)
				)
		),

	async execute(interaction) {
		if (!interaction.guild) {
			return interaction.reply({ content: 'Bu komut sadece bir sunucuda kullanılabilir.', ephemeral: true });
		}

		if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply({ content: 'Bu komutu kullanmak için Yönetici yetkisi gerekiyor.', ephemeral: true });
		}

		const action = interaction.options.getString('action');
		const targetUser = interaction.options.getUser('hedef');
		const amount = interaction.options.getInteger('miktar');

		if (!targetUser) {
			return interaction.reply({ content: 'Lütfen geçerli bir hedef kullanıcı seçin.', ephemeral: true });
		}

		if (!Number.isInteger(amount) || amount <= 0) {
			return interaction.reply({ content: 'Miktar pozitif tam sayı olmalıdır.', ephemeral: true });
		}

		const player = getPlayer(targetUser.id);
		const oldGold = player.gold ?? 0;
		let newGold;

		if (action === 'add') {
			newGold = oldGold + amount;
			player.gold = newGold;
		} else if (action === 'remove') {
			newGold = Math.max(oldGold - amount, 0);
			player.gold = newGold;
		} else if (action === 'set') {
			newGold = amount;
			player.gold = newGold;
		} else {
			return interaction.reply({ content: 'Geçersiz işlem. (ekle, sil, ayarla)', ephemeral: true });
		}

		setPlayer(targetUser.id, player);

		await interaction.reply({
			content: `✅ ${targetUser.tag} için gold güncellendi. Eski: ${oldGold}, Yeni: ${newGold} (işlem: ${action}).`,
			ephemeral: true,
		});
	},
};
