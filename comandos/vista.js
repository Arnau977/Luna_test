// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'vista',
    description: "Marca una pelicula como 'Vista'.",
    usage: "{Nombre Pelicula}",
    args: true,
    aliases: ['ver', 'v'],

    execute(message = Discord.Message, args = '') {
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

            var usuarioDB = new Discord.User();
            usuarioDB = message.author;
            // Check cuantas peliculas encajan

            var check = `SELECT count(id_estado) AS count FROM estado WHERE id_pelicula IN (SELECT id_pelicula FROM peliculas WHERE lower(Nombre_Pelicula) like '${args.toLocaleLowerCase()}%') AND estado LIKE 'Pendiente' OR estado like 'Viendo';`

            pool.query(check, function (err, check_result) {
                if (err) throw err;
                console.log("Found: " + check_result[0].count);
                if (check_result[0].count > 1) {
                    message.channel.send("Hay más de 1 película que encaja con ese nombre. Cual deseas actualizar?");
                    var SQLIST = `SELECT distinct Nombre_Pelicula, FechaAdición, id_estado from peliculas join estado on estado.id_pelicula = peliculas.id_pelicula WHERE peliculas.id_pelicula IN (SELECT id_pelicula FROM peliculas WHERE lower(Nombre_Pelicula) like '${args.toLocaleLowerCase()}%') AND estado LIKE 'Pendiente' OR estado like 'Viendo';`;
                    pool.query(SQLIST, function (err, resultPelis) {
                        if (err) throw err;
                        let i = 1;
                        const pelis = new Discord.RichEmbed()
                            .setTitle("Actualizar película")
                            .setColor(`${cfg.color}`);

                        resultPelis.forEach(peli => {
                            pelis.addField(i + '. **' + peli.Nombre_Pelicula + "**", peli.FechaAdición);
                            console.log(peli)
                            i++;
                        });  //(entry => {});
                        message.channel.send(pelis);

                        message.channel.awaitMessages(m => m.author.id == message.author.id,
                            { max: 1, time: 30000 }).then(collected => {
                                // only accept messages by the user who sent the command
                                // accept only 1 message, and return the promise after 30000ms = 30s

                                // first (and, in this case, only) message of the collection
                                let j = 1;
                                let bool = false;
                                resultPelis.forEach(peli => {
                                    if (collected.first().content.toLowerCase() === `${j}`) {
                                        update(peli);
                                        bool = true;

                                    }
                                    j++;
                                });
                                if (!bool) { message.reply('Operación canceleda.'); }

                            }).catch(() => {
                                message.reply('No he recibido una respuesta en 30 segundos, Operación canceleda.');
                            });
                    });
                } else {
                    var sql = `UPDATE estado SET Estado = 'Vista' WHERE id_pelicula IN (select id_pelicula FROM peliculas WHERE lower(Nombre_Pelicula) like '${args.toLocaleLowerCase()}%') AND estado NOT LIKE 'Vista';`;
                    pool.query(sql, function (err, updateEstado_result) {
                        if (err) throw err;
                        affected_rows = updateEstado_result.affectedRows;

                        SQL_feedback(updateEstado_result);

                        if (affected_rows) {
                            console.log("\nMovie status updated\n\n");
                            message.channel.send(`He actualizado la pelicula ***${args}***  a 'Vista'`);
                        } else {
                            console.log("\nMovie status update Failed\n\n");
                            message.channel.send(`Parece que ha habido un error, estás seguro de que la pelicula se llamaba así?`);
                        }

                    });

                    var sql = `UPDATE estado SET FechaVisualización = '${message.createdAt.toLocaleString().slice(0, 10)}' WHERE id_pelicula IN (select id_pelicula FROM peliculas WHERE lower(Nombre_Pelicula) like '${args.toLocaleLowerCase()}%') AND estado NOT LIKE 'Vista';`;
                    pool.query(sql, function (err, updateFecha_result) {
                        if (err) throw err;
                        SQL_feedback(updateFecha_result);
                        if (updateFecha_result) {
                            console.log("Movie seen date updated\n\n");
                        } else {
                            console.log("Movie seen date update failed\n\n");
                        }

                    });

                }
            });

        } catch (error) {
            console.log("Se ha producido un error realizando la acción 'vista': \n" + error);
            message.channel.send("Se ha producido un error realizando la acción");
        }

        function update(peli) {
            var sql = `UPDATE estado SET Estado = 'Vista' WHERE id_estado = ${peli.id_estado};`;
            pool.query(sql, function (err, updateEstado_result) {
                if (err) throw err;

                SQL_feedback(updateEstado_result);

                affected_rows = updateEstado_result.affectedRows;

                if (affected_rows) {
                    console.log("\nMovie status updated\n\n");
                    message.channel.send(`He actualizado la pelicula ***${args}***  a 'Vista'`);
                } else {
                    console.log("\nMovie status update Failed\n\n");
                    message.channel.send(`Parece que ha habido un error, estás seguro de que la pelicula se llamaba así?`);
                }

            });

            var sql = `UPDATE estado SET FechaVisualización = '${message.createdAt.toLocaleString().slice(0, 10)}' WHERE id_estado = ${peli.id_estado};`;
            pool.query(sql, function (err, updateFecha_result) {
                if (err) throw err;

                SQL_feedback(updateEstado_result);

                affected_rows = updateFecha_result.affectedRows;
                if (affected_rows) {
                    console.log("Movie seen date updated\n\n");
                    message.channel.send(`He actualizado la pelicula ***${args}***  a 'Vista'`);
                } else {
                    console.log("Movie seen date update failed\n\n");
                    message.channel.send(`Parece que ha habido un error, estás seguro de que la pelicula se llamaba así?`);
                }
            });
        }

        function SQL_feedback(result) {
            var mensaje = `\n\tAffected rows: ${result.affectedRows}`;
            if (result.message != '') {
                mensaje = mensaje + "\n\tResult: " + result.message;
            }
            // type + ":\n" + "\tAffected rows: " + result.affectedRows + "\n\tResult: " + result.message

            console.log("Operation: " + mensaje);

        }

    },
};