// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
  name: 'pick',
  description: "Elige una pelicula aleatoria entre las peliculas con estado 'Pendiente'.",
  usage: '{nombre del comando} / {nombre del comando} {pelicula a elegir}',
  args: false,
  aliases: ['elige', 'random', 'select'],

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
    if (args) {
      var update_sql = `UPDATE estado SET estado = 'Viendo' WHERE id_pelicula LIKE (SELECT id_pelicula FROM peliculas WHERE lower(Nombre_Pelicula) LIKE '${args.toLocaleLowerCase()}')`;
      pool.query(update_sql, function (err, update_result) {
        if (err) throw err;
        console.log(update_result.affectedROws);
      });
    } else {
      var SQLcheck = `select count(ID_Pelicula) as count from estado where estado like 'Viendo'`;

      pool.query(SQLcheck, function (err, CountResult) {
        if (err) throw err;

        if (CountResult.count != 0) {
          var SQLpick = `select count(ID_Pelicula) as NºFilas from estado where estado like 'Pendiente'`;

          pool.query(SQLpick, function (err, Pelisresult) {
            if (err) throw err;

            var TotalRows = Pelisresult[0].NºFilas;
            if (TotalRows) {
              var res = random(0, TotalRows);

              var sql = `SELECT Nombre_Pelicula, FechaAdición, estado.id_pelicula from peliculas join estado on estado.id_pelicula = peliculas.id_pelicula where estado like 'Pendiente' order by Nombre_Pelicula desc LIMIT ${res}, 1;`;
              pool.query(sql, function (err, result) {
                if (err) throw err;
                var update_sql = `UPDATE estado set estado = 'Viendo' where id_pelicula = ${result[0].id_pelicula}`;
                pool.query(update_sql, function (err, update_result) {
                  if (err) throw err;
                  console.log(update_result.affectedROws);
                });

                console.log(`\nSelecting Movies: ${res}\n\n`);
                message.channel.send(`\nPelicula: **${result[0].Nombre_Pelicula}**\nFecha: *${result[0].FechaAdición}*`);
              });

            } else {
              message.channel.send(`No hay películas pendientes :thinking:`);
              console.log("\nNo hay películas pendientes\n");
            }

          });
        } else {
          message.channel.send(`Ya hay una película en estado 'Viendo' :thinking:`);
        }

      });
    }

    function random(min, max) {
      return Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
    }
  },
};