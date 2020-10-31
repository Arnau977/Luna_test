// Básicas
const Discord = require('discord.js')
const client = new Discord.Client();

var autorUser = new Discord.User(); // Para referirse al autor del bot como usuario
var botUser = new Discord.User(); // Para referirse al propio bot como usuario

const Filecfg = `C:/Users/Arnau977/Desktop/Luna/cfg.json`;
const cfg = require(Filecfg);

// Cine
const hook = new Discord.WebhookClient("720085171487113286", "zckARSnZNkwsBQVXFNtb6kLJKQVPOZQd5BJstwhgYvsua0r0m18WHjelHmYKrkVo9y-A");
var palomitas_saladas = "https://i.pinimg.com/originals/c6/be/53/c6be53257eb8315594d346609af3a998.png";
var palomitas_dulces = "https://i.pinimg.com/originals/30/40/9f/30409f74d7ea095de0ee73aaaf592cbe.png";
var fanta = "https://i.pinimg.com/originals/68/c3/a5/68c3a588e025b3f98b3c7c76695c972d.png";
var cocacola = "https://i.pinimg.com/originals/be/57/60/be576092f945b413e5a396e9959d2a67.png";

module.exports = {
    name: 'catalogo',
    description: 'Si solamente escribes el comando, muestra el catálogo. Si añades un argumento te permite elegir.',
    usage: '{bebida fanta/coca-cola} / {palomitas dulces/saladas}',
    args: true,
    execute(message, args) {
        var cat_Var = args.split(' ');
        var cat_SubCommand = cat_Var.shift(' ');
        var cat_Arg = cat_Var.join();

        if (cat_SubCommand) {
            switch (cat_SubCommand) {

                case 'palomitas':
                    var pal_cat_Var = cat_Arg.split(' ');
                    var pal_cat_SubCommand = pal_cat_Var.shift(' ');
                    var cat_Arg = pal_cat_Var.join();

                    switch (pal_cat_SubCommand) {
                        case 'saladas':
                            message.channel.sendFile('C:/Users/Arnau977/Desktop/Luna/media/palomitas_sal.png');
                            var ID_compra = Math.random().toString(36).slice(2);
                            message.author.send(`Este es el codigo identificador de su compra, guardelo por si algo ocurriera:  || ${ID_compra.toUpperCase()} ||`);
                            break;

                        case 'dulces':
                            message.channel.sendFile('C:/Users/Arnau977/Desktop/Luna/media/palomitas_dulce.png');
                            var ID_compra = Math.random().toString(36).slice(2);
                            message.author.send(`Este es el codigo identificador de su compra, guardelo por si algo ocurriera:  || ${ID_compra.toUpperCase()} ||`);
                            break;

                        default:
                            message.channel.send("Lo siento, creo que te has confundido al escribir. Decide si quieres Palomitas dulces o saladas.");
                            break;
                    }
                    break;

                case 'bebida':
                    var beb_cat_Var = cat_Arg.split(' ');
                    var beb_cat_SubCommand = beb_cat_Var.shift(' ');
                    var cat_Arg = beb_cat_Var.join();

                    switch (beb_cat_SubCommand) {
                        case 'fanta':
                            message.channel.sendFile('C:/Users/Arnau977/Desktop/Luna/media/fanta.png');
                            var ID_compra = Math.random().toString(36).slice(2);

                            message.author.send(`Este es el codigo identificador de su compra, guardelo por si algo ocurriera:  || ${ID_compra.toUpperCase()} ||`);
                            break;

                        case 'coca-cola':
                            message.channel.sendFile('C:/Users/Arnau977/Desktop/Luna/media/cocacola.png');
                            var ID_compra = Math.random().toString(36).slice(2);
                            message.author.send(`Este es el codigo identificador de su compra, guardelo por si algo ocurriera:  || ${ID_compra.toUpperCase()} ||`);
                            break;

                        default:
                            message.channel.send("Lo siento, creo que te has confundido al escribir. Decide si quieres Fanta o coca-cola (No hay pepsi).");
                            break;
                    }
                    break;

                default:
                    message.channel.send("Lo siento, creo que te has confundido al escribir. Decide si quieres Palomitas o bebida (recuerda que se venden por separado).");
                    break;
            }
        } else {
            // Envia un webhook al canal general de Pink Panda con el menú
            let Menu = [];
            Menu.push(new Discord.RichEmbed()
                .setTitle('Menú de Hoy')
                .setColor(`${cfg.color}`));

            Menu.push(new Discord.RichEmbed()
                .addField(`Palomitas`, `Saladas`)
                .setThumbnail(palomitas_saladas));

            Menu.push(new Discord.RichEmbed()
                .addField(`Palomitas`, `Dulces`)
                .setThumbnail(palomitas_dulces));

            Menu.push(new Discord.RichEmbed()
                .setColor(`${cfg.color}`)
                .setTitle('Bebidas'));

            Menu.push(new Discord.RichEmbed()
                .addField(`Bebida`, `Fanta`)
                .setThumbnail(fanta));

            Menu.push(new Discord.RichEmbed()
                .addField(`Bebida`, `Coca-Cola`)
                .setThumbnail(cocacola));
            hook.send({ embeds: Menu });
        }
    },
};