// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'vistas',
    description: "lista las películas marcadas como 'vista'.",
    usage: '{nombre del comando}',
    args: false,
    aliases: ['terminadas', 'end'],

    execute(message, args) {
        try {
            var pool = mysql.createPool({
                connectionLimit: 10,
                host: '127.0.0.1',
                user: 'root',
                password: cfg.sql_password,
                database: 'luna_' + message.guild.id,
                insecureAuth: true
            });
            exports.Pool = pool;

            const PelisVistas = new Discord.RichEmbed()
                .setTitle("Peliculas Vistas")
                .setColor(`${cfg.vista_color}`);

            var SQLIST = `select count(ID_Pelicula) as NºFilas from estado where estado like 'Vista'`;
            pool.query(SQLIST, function (err, Pelisresult) {
                if (err) throw err;

                var TotalRows = Pelisresult[0].NºFilas;
                if (TotalRows > 0) {
                    var SQLIST = `SELECT Nombre_Pelicula, estado.FechaVisualización, estado from peliculas join estado on estado.id_pelicula = peliculas.id_pelicula where estado like 'Vista' order by Nombre_Pelicula;`;
                    pool.query(SQLIST, function (err, resultPelis) {
                        if (err) throw err;
                        resultPelis.forEach(element => {
                            console.log(`\nListing Movies\n${element.Nombre_Pelicula}\n`);
                            PelisVistas.addField(`${element.Nombre_Pelicula}`, `${element.FechaVisualización}`);
                        });  //(entry => {});
                        message.channel.send(PelisVistas);
                    });
                } else {
                    PelisVistas.addField(`Aún no has visto ninguna película`, `:thinking:`);
                    message.channel.send(PelisVistas);
                }
            });
        } catch (error) {
            console.log("Se ha producido un error realizando la acción 'vista': \n" + error);
            message.channel.send("Se ha producido un error realizando la acción");
        }
    },
};