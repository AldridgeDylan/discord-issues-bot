import DiscordJS, {Intents} from 'discord.js';
import dotenv from 'dotenv';
import  axios from 'axios';
import qs from 'qs';
import fs from 'fs';
import arrayToTxtFile from 'array-to-txt-file';

dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

let channelArray = new Array();

client.on('ready', () => {

    var text = fs.readFileSync("./issues.txt", 'utf-8');
    channelArray = text.split('\r\n')

    console.log("bot is running"); 
    const guild = client.guilds.cache.get("962266275067854868"); //manually input the ID of the server

    setInterval(function() {

        var data = qs.stringify({
    
        });
        var config = {
        method: 'get',
        url: 'http://44.201.133.152:3000/status/activeIssues',
        headers: { },
        data : data
        };
    
        axios(config)
        .then(async function (response) {

            let issues = response.data;
            console.log(issues.activeErrors);

            for(let i=0;i<issues.activeErrors.length;i++){

                if(!channelArray.includes(issues.activeErrors[i].id)) { 

                    let str1 = "Issue ID: ";
                    let str2 = "Issue Description: ";
                    let str3 = "Time: ";
                    
                    guild.channels.create(issues.activeErrors[i].id, { parent: "962689833795465267"}) //manually input the ID of the 'Active Errors' category
                    .then(function (created_channel) {

                        channelArray.push(issues.activeErrors[i].id);
                        var channel = client.channels.cache.get(created_channel.id);
                        channel.send({content: str1.concat(issues.activeErrors[i].id)});
                        channel.send({content: str2.concat(issues.activeErrors[i].description)});
                        let time = Date(issues.activeErrors[i].timestamp*1000);
                        channel.send({content: str3.concat(time)});
                        let format = '\r\n';
                        fs.appendFileSync('issues.txt', format.concat(issues.activeErrors[i].id));

                    })
                    .catch(console.error);

                } 

            }

        })
        .catch(function (error) {
        console.log(error);
        });

    }, 20 * 1000); //60 * 1000

});

client.on('messageCreate', (message) => {
    if(!message.member.roles.cache.some(role => role.name === 'ADMINISTRATOR')) return  //manually input the correct role
    if(message.content === 'issue resolved'){

        let channelName = message.channel.name;

        var data = qs.stringify({
            'id': channelName
        });
        var config = {
            method: 'post',
            url: 'http://44.201.133.152:3000/status/resolveIssue',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };
          
        axios(config)
        .then(function (response) {
            channelArray = channelArray.filter(function(value){ 
                return value.toLowerCase() != channelName ;
            });
            arrayToTxtFile(channelArray, './issues.txt', err => {
                if(err) {
                  console.error(err)
                  return
                }
                console.log('Successfully wrote to txt file')
            })
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

        message.channel.setParent("963791742191165520"); //manually input the ID of the 'Resolved issues' category
    
    }
    
})

client.login(process.env.TOKEN);