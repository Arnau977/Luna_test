// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'lista',
    description: "Lista todas las peliculas con el estado 'Pendiente'.",
    usage: '{nombre del comando}',
    args: false,
    aliases: ['listar', 'pendientes', 'list'],

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
        
        const PelisLista = new Discord.RichEmbed()
            .setTitle("Peliculas Pendientes")
            .setColor(`${cfg.pendiente_color}`);

        var SQLIST = `select count(ID_Pelicula) as NºFilas from estado where estado like 'Pendiente'`;
        pool.query(SQLIST, function (err, Pelisresult) {
            if (err) throw err;

            var TotalRows = Pelisresult[0].NºFilas;
            if (TotalRows) {
                var SQLIST = `SELECT distinct Nombre_Pelicula, FechaAdición, estado from peliculas join estado on estado.id_pelicula = peliculas.id_pelicula where estado like 'Pendiente' or estado like 'Viendo' order by Nombre_Pelicula;`;
                pool.query(SQLIST, function (err, resultPelis) {
                    if (err) throw err;
                    resultPelis.forEach(peli => {
                        if (peli.estado === 'Pendiente') {
                            PelisLista.addField(`${peli.Nombre_Pelicula}`, `${peli.FechaAdición}`);
                            console.log("\nListing Movies\n\n");
                        } else {
                            PelisLista.addField(`${peli.Nombre_Pelicula} *(Seleccionada)*`, `${peli.FechaAdición}`);
                            console.log("\nListing Movies (Current)\n\n");
                        }

                    });  //(entry => {});
                    message.channel.send(PelisLista);
                });
            } else {
                PelisLista.addField(`¡Felicidades, no tienes peliculas pendientes!`, `:thinking:`);
                message.channel.send(PelisLista);
            }
        });
    },
};