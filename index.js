const { Client, MessageMedia, List, Buttons, LocalAuth} = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
    axios.get('https://tamitut.com/PAYA/comandosjson.php')
            .then(result=> {
                console.log(result.data)// se envia el resultado obtenido
            })
            .catch(error =>{
                console.log(error);
            });
});


client.on('message', async msg => {

    if (msg.body === '!ping') {
        msg.reply('pong');

    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    
    } else if (msg.body === '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!chats') {
        const chats = await client.getChats();
        client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    } else if (msg.body === '!info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);

    }  else if (msg.body === '!mention') {
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        chat.sendMessage(`Hi @${contact.number}!`, {
            mentions: [contact]
        });
        }
     else if (msg.body === '!ayuda') {
            let button = new Buttons(
                'Centro de Ayuda',// cuerpo del mensaje
                [
                    { body: 'Pa Yá', url: 'https://pidepaya.com/' },
                    { body: 'Llamame', number: '+507 209-3373' },
                    { body: 'X', number: '+1 (202) 968-6161' },// Botones especiales de llamada solo puede ser un máximo de 2 botones.
                    { body: '!ping' },
                    { body: '!list' },
                ],
                'Lista de Botones', // titutlo del mensaje
                'Hola'
            );
            client.sendMessage(msg.from,  button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }    else if (msg.body === '!sticker') {//linea de comando para que el bot mande un sticker.
        const chat = await msg.getChat();
        const sticker = MessageMedia.fromFilePath('Stickerrobot.webp');//debe tener el mismo nombre y formato WEBP, y estar en el mismo directorio del programa.
        chat.sendMessage(sticker, { sendMediaAsSticker: true })
      }
      else if (msg.hasMedia){//descargar la foto
        console.log("After IF");
        const downloadMedia = await msg.downloadMedia();
        console.log(downloadMedia.mimetype);
        let subExt = downloadMedia.mimetype
        const ext = subExt.substring(subExt.lastIndexOf('/') + 1);
        const buffer = Buffer.from(downloadMedia.data, "base64");//convierte el dato a base64
        const file = client + "-" + Date.now() + "." + ext;
        console.log(downloadMedia);
        fs.writeFile("./media/" + file, buffer, function (err) {// debe crear archivo media o el nombre que le indique, pero debe estar en el directorio del programa.
            if (err) {
                console.error(err);
                }else{
                    }
            });
        }
        else if (msg.body === '!pdf') {//linea de comando para que el bot mande un sticker.
            const media = MessageMedia.fromFilePath('HV.pdf'); //I DO CHECK IF FILE EXISTS.
            msg.reply(media);
          }
          
        else if(msg.body === '!server') {//linea de comando para el retorno de un mensaje atraves de un ENDPOINT.
                axios.get('https://tamitut.com/PAYA/apiadan.php')
            .then(result=> {
                msg.reply(result.data)// se envia el resultado obtenido
            })
            .catch(error =>{
                console.log(error);
            });
        
            }
            else if (msg.location){
                let data = JSON.stringify( msg.location )
                // se envia msg.location al json.
     
                fs.writeFile("Location.json", data , 'utf8', function (err) {
                    if (err) {
                        console.log("An error occured while writing JSON Object to File.");
                        return console.log(err);
                    }
                
                    console.log("JSON file has been saved.");
                });  
              }    


});
