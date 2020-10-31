// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

module.exports = {
    name: 'test',
    description: "test.",
    aliases: ['prueba', 'debug', 't'],
    usage: '{nombre del comando}',

    execute(message, args) {

        console.log("test");
        message.channel.send("test");
    },
};