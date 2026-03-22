const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Bir kullanıcının avatarını gösterir.')
		.addUserOption(option =>
			option
				.setName('kullanici')
				.setDescription('Avatarını görmek istediğin kullanıcı')
				.setRequired(false)
		),

	async execute(interaction) {
		const user = interaction.options.getUser('kullanici') ?? interaction.user;
		const url = user.displayAvatarURL({ size: 1024 });
		await interaction.reply({ content: `${user.username} avatarı:\n${url}` });
	},
};