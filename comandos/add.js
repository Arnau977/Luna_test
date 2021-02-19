// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

var mysql = require("mysql");

module.exports = {
    name: 'add',
    description: 'Añade una pelicula a la base de datos.',
    usage: '{nombre pelicula}',
    args: true,
    aliases: ['añadir', 'añade'],

    execute(message = Discord.Message, args = '') {
        var pool = mysql.createPool({
            connectionLimit: 10,
            host: '127.0.0.1',
            user: 'root',
            password: cfg.sql_password,
            database: 'luna_' + message.guild.id,
            insecureAuth: true
        });
        exports.Pool = pool;

        args.trim();

        var usuarioDB = new Discord.User();
        usuarioDB = message.author;
        // Añadir Clave primaria y campo único 
        console.log("Fecha: " + message.createdAt.toLocaleDateString());
        var sql = `INSERT INTO peliculas (Nombre_Pelicula, FechaAdición) VALUES ('${args}', '${message.createdAt.toLocaleDateString()}');`;
        pool.query(sql, function (err, _result) {
            if (err) throw err;
            SQL_feedback(_result)
        });

        sql = `INSERT INTO estado (
            ID_pelicula, ID_usuario, FechaVisualización
        ) VALUES (
            (
            select max(id_pelicula) from peliculas), (
            select id_usuario from usuario where discordid like  '${usuarioDB.id}'), (
            select FechaAdición from peliculas where id_pelicula like (select max(id_pelicula) from peliculas))
        );`;
        pool.query(sql, function (err, _result) {
            if (err) throw err;
            SQL_feedback(_result)

            console.log("\nNew Movie inserted\n\n");
            message.channel.send(`He registrado la pelicula ***${args}***  en la base de datos`);
        });

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