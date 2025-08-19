// index.js

const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const fs = require("fs");

// إنشاء الكلاينت
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel]
});

// حدث التشغيل
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// أمر -تيكت
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content === "-تيكت") {
        const ticketImage = "ticket.png";
        if (!fs.existsSync(ticketImage)) return message.reply("⚠️ لم أجد الصورة ticket.png في مجلد البوت!");

        const embed = new EmbedBuilder()
            .setTitle("نظام التذاكر")
            .setDescription("اضغط على الزر المناسب لفتح تذكرتك")
            .setColor("Purple")
            .setImage("attachment://ticket.png");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("admin_ticket").setLabel("🔺| الإدارة العليا").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("ask_ticket").setLabel("❔| الاستفسار").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("complain_ticket").setLabel("📩 | الشكوى").setStyle(ButtonStyle.Success)
        );

        await message.channel.send({
            embeds: [embed],
            files: [ticketImage],
            components: [row]
        });
    }
});

// التعامل مع الأزرار
let ticketCount = 0;

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    let roleCheck = false;
    if (interaction.customId === "admin_ticket") {
        roleCheck = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!roleCheck) return interaction.reply({ content: "❌ هذا الزر مخصص للإدارة العليا فقط.", ephemeral: true });
    } else {
        roleCheck = interaction.member.roles.cache.size > 0; // أي رتبة عدا الادمن
        if (!roleCheck || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ هذا الزر مخصص للإداريين فقط (بدون الصلاحيات العليا).", ephemeral: true });
        }
    }

    ticketCount++;
    const ticketChannel = await interaction.guild.channels.create({
        name: `VannilaTicket-${ticketCount}`,
        type: 0, // Text channel
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
                id: interaction.guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel],
            }
        ]
    });

    const embed = new EmbedBuilder()
        .setTitle("🎟️ تذكرة جديدة")
        .setDescription(`مرحباً ${interaction.user}, سيتم الرد عليك قريباً.`)
        .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("close_ticket").setLabel("إغلاق التذكرة").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("reply_ticket").setLabel("رد الإداري").setStyle(ButtonStyle.Success)
    );

    await ticketChannel.send({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [row]
    });

    interaction.reply({ content: `✅ تم فتح تذكرتك: ${ticketChannel}`, ephemeral: true });
});

// زر الإغلاق والرد
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "close_ticket") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "❌ فقط الإداريين يمكنهم إغلاق التذكرة.", ephemeral: true });
        }
        await interaction.channel.delete();
    }

    if (interaction.customId === "reply_ticket") {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "❌ فقط الإداريين يمكنهم استخدام زر الرد.", ephemeral: true });
        }
        await interaction.reply({ content: `📢 ${interaction.member} بخدمتك!`, allowedMentions: { users: [interaction.user.id] } });
    }
});

// تشغيل البوت
client.login(process.env.TOKEN);
