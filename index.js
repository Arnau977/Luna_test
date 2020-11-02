// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

// Get cfg
const Filecfg = `./cfg.json`;
const cfg = require(Filecfg);

var welcome_msg = ["¡Denle tod@s una calurosa bienvenida a {{user}}!", "¡{{user}} se une a la batalla!", "¡Un {{user}} salvaje apareció!"];


// Variables por servidor
const Enmap = require('enmap');
client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {
  prefix: cfg.PREFIX,
  modLogChannel: "mod-log",
  modRole: "Moderator",
  adminRole: "Administrator",
  welcomeChannel: "welcome",
  welcomeMessage: welcome_msg[random(0, welcome_msg.length)]
}

// Start Dynamic Commands
const fs = require("fs");
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./comandos').filter(file => file.endsWith('.js'));

// Base de datos
var mysql = require("mysql");
const { restart } = require('nodemon');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: cfg.sql_password,
  database: 'luna',
  insecureAuth: true
});
exports.Pool = pool;

client.login(cfg.token);

// Debugging
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

setInterval(Name_Reminder, 2 * 60 * 1000);
setInterval(update_commands, 5 * 60 * 1000)

// Cuando alguien se une al servidor
client.on("guildMemberAdd", function (member) {
  var NewUserSQL = `INSERT INTO usuario (discordid, usuario, fechaunión) VALUES ('${member.id}', '${member.user.username}', '${member.joinedAt.toLocaleString()}');`;
  pool.query(NewUserSQL, function (_err, _result) {
    console.log(`\nEl usuario ${member.user.username} se ha unido al servidor.\n`);
  });
  client.settings.ensure(member.guild.id, defaultSettings);
  let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");
  welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)
  member.guild.channels
    .find("name", client.settings.get(member.guild.id, "welcomeChannel"))
    .send(welcomeMessage)
    .catch(console.error);
});

// Cuando alguien se va del servidor
client.on("guildMemberRemove", function (member) {
  var DelUserSQL = `DELETE FROM usuario WHERE discordid = '${member.id}';`;
  pool.query(DelUserSQL, function (_err, _result) {
    console.log(`\nEl usuario ${member.user.username} se ha ido del servidor.\n`);
  });
});

// Cuando el bot entra a un nuevo servidor
client.on('guildCreate', async guild => {
  try {
    createDB(guild.id);
  } catch (error) {
    autorUser.send("Ha ocurrido un error al crear la base de datos, para tratar de solucionar el problema pongase en contacto con mi dueño: " + autorUser.tag)
  }

})

// Cuando el bot sale de un servidor
client.on('guildDelete', async guild => {
  try {
    deleteDB(guild.id);
    client.settings.delete(guild.id);
  } catch (error) {
    autorUser.send("Ha ocurrido un error al eliminar la base de datos asociada al servidor con id: " + guild.id)
  }
})

// Cuando alguien elimina un mensaje
client.on('messageDelete', async message => {
  if (message.author.bot) return;
  var AudiLog = await message.guild.fetchAuditLogs({ type: 72 });
  var entry = AudiLog.entries.first()
  autorUser.send(`${entry.executor}, podría haber borrado el mensaje de <@!${message.author.id}> que dice: ***${message.content}*** ???`)
})

client.on('disconnect', async () => {
  autorUser.send("Me desconecto mi señor");
  botUser.addFriend(autorUser);
});

client.on('ready', async () => {
  botUser = client.user;
  autorUser = await client.fetchUser(`${cfg.autoruser}`);
  autorUser.send("¡Estoy en linea!");
  console.log(`\n\n\n${client.user.tag} se acaba de despertar\n\n`);
  client.user.setPresence({ status: 'online', game: { name: `${cfg.game_name}`, type: `${cfg.estado}` } });
  update_commands();
});


client.on('message', async message => {
  if (message.content === 'debug' && message.author.id === autorUser.id) {
    Listar_pelis();
  }

  if (message.author.bot) return;

  if (message.content.startsWith(cfg.PREFIX)) {
    const input = message.content.slice(cfg.PREFIX.length).trim().split(' ');
    // ::set fc 6359-2047-5312 
    // Separadado en diferentes elementos y eliminado el prefijo
    const commandName = input.shift().toLowerCase();
    // Guardo el primer elemento de input en command
    const commandArgs_Original = input.join(' ');
    // El resto lo meto en commandArgs

    //const command = client.commands.get(commandName);
    if (message.author.id === autorUser.id && message.content === cfg.PREFIX + restart) {
      return RestartBot();
    }

    if (message.channel.type === "dm") {
      message.channel.send("Lo siento, aún no estoy preparada para responderte por mensaje privado")
    } else {
      console.log(message.guild.name, ': ', message.author.username, 'en el canal:', message.channel.name, ':', message.content, ` (${message.createdAt})`, '\n');

      const command = client.commands.get(commandName)
        || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      if (!command) {
        const answer = random(1, 5);
        switch (answer) {
          case 1:
            message.reply('Ese comando no es mío... Acaso me engañas con otra? :c');
            break;
          case 2:
            message.reply('Espero que haya pudín');
            break;
          case 3:
            message.reply('No te preocupes, estás tan cuerdo como yo');
            break;
          case 4:
            message.reply('Vámonos padre. Harry no quiere hablar con nosotros, pero es demasiado educado para decirlo');
            break;
          case 5:
            message.reply('Estoy segura que fueron los nargles');
        }
        console.log('El valor random es:', answer, '\n');
        return;
      }

      if (command.args && !commandArgs_Original.length) {
        let reply = `¡No has proporcionado ningún argumento, ${message.author}!`;

        if (command.usage) {
          reply += `\nEl uso correcto de ese comando sería: \`${cfg.PREFIX}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
      }

      try {
        command.execute(message, commandArgs_Original);
      } catch (error) {
        console.error(error);
        message.reply('¡Ha ocurrido un error ejecutando tu comando!');
      }
    }
  }
});


//Funciones

function Listar_pelis(resultado_consulta) {
  // Envia un webhook al canal general de Pink Panda con el menú
  let Pelis_Pendientes = [];
  var Titulo = new Discord.RichEmbed()
    .setTitle('Peliculas Pendientes')
    .setColor(`${cfg.color}`);
  hook.send({ embeds: Titulo })

  Pelis_Pendientes.push(new Discord.RichEmbed()
    .setColor(`${cfg.color}`));

  resultado_consulta[0].forEach(element => {
    Pelis_Pendientes.addField(`${element.Nombre_Pelicula}`, `${element.FechaAdición}`)
  });
  hook.send({ embeds: Pelis_Pendientes });

}


/* Elige cuantos caracteres con string_length y elige esa cantidad de letras aleatorias
function randomLetter(string_length){
  var emptyString = [];
  while (emptyString.length < string_length) {
    emptyString += alphabet[Math.floor(Math.random() * alphabet.length)];
  } 
  return(emptyString);
}
*/
function random(min, max) {
  return Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
}

function random_string() {
  var random_string = Math.random().toString(36).slice(2);
  return (random_string);
}

function Name_Reminder() {
  console.log(`\nYo soy ${botUser.tag}\n`);
}

function update_commands() {
  for (const file of commandFiles) {
    const command = require(`./comandos/${file}`);
    client.commands.set(command.name, command)
  }
}

function RestartBot() {
  autorUser.send('Reiniciando...')
    .then(() => client.destroy())
    .then(() => client.login(cfg.token));
}

function createDB(guild_id) {
  var pool_CreateDB = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: cfg.sql_password,
    database: 'luna_' + guild_id,
    insecureAuth: true
  });
  exports.Pool = pool_CreateDB;

  pool.query(`CREATE DATABASE luna_${guild_id}`, function (err) {
    if (err) throw err;
    console.log("Database created");
  })

  let createPeliculas = `CREATE TABLE peliculas (
          ID_Pelicula int NOT NULL AUTO_INCREMENT,
          Nombre_Pelicula varchar(150) DEFAULT NULL,
          FechaAdición varchar(10) DEFAULT NULL,
          PRIMARY KEY (ID_Pelicula),
          UNIQUE KEY Nombre_Pelicula_UNIQUE (Nombre_Pelicula)
        ) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`
  pool_CreateDB.query(createPeliculas, function (err) {
    if (err) throw err;
    console.log("Tabla Peliculas creada");
  });

  let createUsuarios = `CREATE TABLE usuario (
          ID_Usuario int NOT NULL AUTO_INCREMENT,
          DiscordID varchar(18) DEFAULT NULL,
          Usuario varchar(45) DEFAULT NULL,
          FechaUnión varchar(10) DEFAULT NULL,
          PRIMARY KEY (ID_Usuario),
          UNIQUE KEY DiscordID_UNIQUE (DiscordID)
        ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`
  pool_CreateDB.query(createUsuarios, function (err) {
    if (err) throw err;
    console.log("Tabla Usuarios creada");
  });

  let createEstado = `CREATE TABLE estado (
          ID_Estado int NOT NULL AUTO_INCREMENT,
          Estado varchar(20) DEFAULT 'Pendiente',
          ID_Pelicula int DEFAULT NULL,
          ID_Usuario int DEFAULT NULL,
          FechaVisualización varchar(10) DEFAULT NULL,
          PRIMARY KEY (ID_Estado),
          KEY ID_Pelicula (ID_Pelicula),
          KEY ID_Usuario (ID_Usuario),
          CONSTRAINT ID_Pelicula FOREIGN KEY (ID_Pelicula) REFERENCES peliculas (ID_Pelicula),
          CONSTRAINT ID_Usuario FOREIGN KEY (ID_Usuario) REFERENCES usuario (ID_Usuario),
          CONSTRAINT estado_chk_1 CHECK ((Estado in (_utf8mb4'Pendiente',_utf8mb4'Vista',_utf8mb4'Viendo')))
        ) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`

  pool_CreateDB.query(createEstado, function (err) {
    if (err) throw err;
    console.log("Tabla Estado creada");
  });
}

function deleteDB(guild_id) {
  let deleteDB = `DROP DATABASE IF EXISTS luna_` + guild_id + `;`;
  try {
    pool.query(deleteDB, function (err) {
      if (err) throw err;
      console.log("Base de datos asociada al servidor " + guild_id + " ha sido eliminada.");
    });
  } catch (error) {
    console.log("Se ha producido un error eliminando la base de datos asociada al servidor " + guild_id + ": \n" + error)
  }
}