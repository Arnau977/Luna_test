// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'sql',
    description: 'Permite eliminar o actualizar películas de la base de datos (actualizar solamente el título).',
    usage: 'sql {update} / {delete}',
    args: true,
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

            if (message.author.id === cfg.autoruser) {
                var sql_Var = args.split(' ');
                var sql_SubCommand = sql_Var.shift(' ');
                var sql_Arg = sql_Var.join(' ');

                switch (sql_SubCommand.toLowerCase()) {
                    case 'delete':
                        console.log("Eliminando una pelicula...");

                        var SQLquery1 = `DELETE FROM estado WHERE ID_Pelicula in (SELECT ID_Pelicula FROM peliculas where lower(Nombre_Pelicula) LIKE '%${sql_Arg.toLowerCase()}%');`;
                        // DELETE FROM estado WHERE ID_Pelicula in (SELECT ID_Pelicula FROM peliculas where lower(Nombre_Pelicula) LIKE '%alfombra1%');
                        var SQLquery2 = `DELETE FROM peliculas WHERE lower(Nombre_Pelicula) like '%${sql_Arg.toLowerCase()}%';`;
                        // DELETE FROM peliculas WHERE lower(Nombre_Pelicula) like '%alfombra1%';

                        pool.query(SQLquery1, function (err, query1_Result) {
                            if (err) console.log(err);
                            SQL_feedback(message, sql_SubCommand, query1_Result);
                        });

                        pool.query(SQLquery2, function (err, query2_Result) {
                            if (err) console.log(err);
                            SQL_feedback(message, sql_SubCommand, query2_Result);
                        });

                        break;

                    case 'update':
                        var commandArgs_update = args.split(' ');
                        var rest = commandArgs_update.shift();
                        var update_args = commandArgs_update.join(' ');

                        update_args = update_args.split(" | ");
                        var Arg1 = update_args.shift();
                        var Arg2 = update_args.shift();
                        rest = update_args.join();

                        // DEBUG message.channel.send(Arg1 + " | " + Arg2);

                        var SQLupdate = `UPDATE peliculas SET Nombre_pelicula = '${Arg2}' WHERE Nombre_pelicula like '%${Arg1.toLowerCase()}%';`;
                        pool.query(SQLupdate, function (err, update_Result) {
                            if (err) throw err;
                            SQL_feedback(message, sql_SubCommand, update_Result);
                        });

                        // DEBUG message.channel.send(`UPDATE peliculas SET Nombre_pelicula = '${Arg2}' WHERE Nombre_pelicula like '%${Arg1.toLowerCase()}%';`);
                        break;

                    default:
                        message.channel(`Puedes usar:\n1. "delete {nombre_pelicula}" para borrar una película.\n2. "update {nombre_pelicula} | {nuevo_nombre}" para actualizar el nombre de una película`);
                        break;
                }
            } else {
                message.channel.send("¡No tienes permisos para hacer eso! Solo mi dueño puede hacerme esas cosas... baka ;(")
            }


            function SQL_feedback(message, type, result) {
                var mensaje = `\n\tAffected rows: ${result.affectedRows}`;
                if (result.message != '') {
                    mensaje = mensaje + "\n\tResult: " + result.message;
                }
                // type + ":\n" + "\tAffected rows: " + result.affectedRows + "\n\tResult: " + result.message
                switch (type) {
                    case 'update':
                        message.channel.send("Update:" + mensaje);
                        break;

                    case 'delete':
                        message.channel.send("Delete:" + mensaje);
                        break;
                }

            }
        } catch (error) {
            console.log("Se ha producido un error realizando la consulta: \n" + error);
            message.channel.send("Se ha producido un error realizando la consulta");
        }

    },
};