// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'current',
    description: "Muestra la película actualmente seleccionada como 'Viendo' (Es la película seleccioanda usando el comando 'pick').",
    usage: '{nombre del comando}',
    args: false,
    aliases: ['actual', 'seleccionada', 'viendo'],

    execute(message, args) {
        var pool = mysql.createPool({
            connectionLimit: 10,
            host: '127.0.0.1',
            user: 'root',
            password: cfg.sql_password,
            database: 'luna_' + message.guild.id,
            insecureAuth: true
        });
        exports.Pool = pool;

        var SQLIST = `SELECT Nombre_Pelicula, FechaAdición, estado.id_pelicula from peliculas join estado on estado.id_pelicula = peliculas.id_pelicula where estado like 'Viendo'`;
        pool.query(SQLIST, function (err, Current_Result) {
            if (err) throw err;
            if (Current_Result[0]) {
                message.channel.send(`La pelicula seleccionada es: **${Current_Result[0].Nombre_Pelicula}**`);
            } else {
                message.channel.send(`Aún no se ha seleccionado ninguna pelicula`);
            }

        });
    },
};