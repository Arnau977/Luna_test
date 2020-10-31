// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

module.exports = {
    name: 'reload',
    description: "Recarga el comando que pases como argumento.",
    aliases: ['recarga'],
    usage: '{nombre del comando}',

    execute(message, args) {

        if (!args.length) return message.channel.send(`No has pasado ningún comando para recargar, ${message.author}!`);
        const commandName = args.toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`No existe ningún comando con el nombre o alias \`${commandName}\`, ${message.author}!`);

        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`¡El comando \`${command.name}\` se ha actualizado correctamente!`);
        } catch (error) {
            console.error(error);
            message.channel.send(`Ha ocurrido un error mientras se recargaba el comando \`${command.name}\`:\n\`${error.message}\``);
        }
    },
};