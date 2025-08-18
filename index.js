const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = "-";

// إعداد الرتب الخاصة بكل زر
const ticketRoles = {
  "شكوى": ["1404798619952873513", "1404797824914427957", "1404800210965631147", "1404800671256936640", "1404801608599994438", "1404802308654628924", "1404802656928530493"],
  "استفسار": ["1404798619952873513", "1404797824914427957", "1404800210965631147", "1404800671256936640", "1404801608599994438", "1404802308654628924", "1404802656928530493"],
  "ادارة": ["1118551040099373186", "1404802825317388429", "1404802656928530493"]
};

// رسالة البوت عند كتابة -تيكت مع صورة
client.on("messageCreate", async (message) => {
  if (message.content === `${prefix}تيكت`) {
    const attachment = new AttachmentBuilder('./ticket.png'); // الصورة

    const embed = new EmbedBuilder()
      .setTitle("🎟️ نظام التذاكر")
      .setDescription("اختر نوع التذكرة من الأزرار بالأسفل")
      .setColor("Random")
      .setImage('attachment://ticket.png'); // ربط الصورة بالـ embed

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("شكوى")
        .setLabel("تقديم شكوى 🗒️")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("استفسار")
        .setLabel("استفسار ❔")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ادارة")
        .setLabel("تيكت ادارة عليا 🔴")
        .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({ embeds: [embed], components: [row], files: [attachment] });
  }
});

// فتح التذكرة عند الضغط على الزر
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const ticketName = interaction.customId;
  const roleIds = ticketRoles[ticketName] || [];

  const channel = await interaction.guild.channels.create({
    name: `ticket-${ticketName}-${interaction.user.username}`,
    type: 0,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ["ViewChannel"],
      },
      {
        id: interaction.user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
      ...roleIds.map((id) => ({
        id: id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      })),
    ],
  });

  await interaction.reply({
    content: `✅ تم فتح تذكرة ${ticketName} <#${channel.id}>`,
    ephemeral: true,
  });
});


// تسجيل دخول البوت
client.login(TOKEN);

