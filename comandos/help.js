// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

module.exports = {
    name: 'help',
    description: "Te manda por Mensaje Privado todos los comandos y una breve descripción.",
    aliases: ['ayuda', 'commands', 'comandos'],
    usage: '{nombre del comando} / {nombre del comando} {comando del que quieres saber más}',
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {

            data.push('Aquí tienes una lista de todos mis comandos:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nPuedes enviar \`${cfg.PREFIX}help [nombre del comando]\` para conseguir info de un comando concreto! (Aún está en progreso)`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('¡Te he enviado un MP (Mensaje Privado) con todos mis comandos!');
                })
                .catch(error => {
                    console.error(`No se ha podido enviar un mensaje al usuario ${message.author.tag}.\n`, error);
                    message.reply('Parece que no puedo enviarte un MP (Mensaje Privado). Tienes los MP deshabilitados?');
                });

        }

        const name = args.toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
        //console.log(c);
        console.log(name);


        if (!command) {
            message.reply('ese no es un comando válido');
        } else {
            const help_msg = new Discord.RichEmbed()
                .setTitle("Ayuda: " + command.name)
                .setColor(cfg.color)
                .setTimestamp();

            if (command.aliases) help_msg.addField(`**Alias:**`, command.aliases.join(', '));
            if (command.description) help_msg.addField(`**Descripción:**`, command.description);
            if (command.usage) help_msg.addField(`**Modo de empleo:**`, cfg.PREFIX + command.name + ' ' + command.usage);
            if (command.example) help_msg.addField(`**Ejemplo:**`, cfg.PREFIX + command.name + ' ' + command.example);
            message.channel.send(help_msg);
        }



    },
};