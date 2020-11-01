// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

module.exports = {
    name: 'setconf',
    description: "Cambia la configuración del bot para este servidor.",
    usage: '{clave a actualizar} {nuevo valor}',
    args: true,
    aliases: ['conf', 'set'],
    example: `prefix +`,

    execute(message, args) {
        const guildConf = client.settings.ensure(message.guild.id, defaultSettings);
        const adminRole = message.guild.roles.find("name", guildConf.adminRole);
        if (!adminRole) return message.reply("Administrator Role Not Found");

        if (!message.member.roles.has(adminRole.id)) {
            return message.reply("You're not an admin, sorry!");
        }
        const [prop, ...value] = args;

        if (!client.settings.has(message.guild.id, prop)) {
            return message.reply("This key is not in the configuration.");
        }
        client.settings.set(message.guild.id, value.join(" "), prop);

        message.channel.send(`La clave de servidor ${prop} ha sido actualizada a:\n\`${value.join(" ")}\``);
    },
};