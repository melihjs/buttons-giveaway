const { Client, Collection } = require('discord.js');
const data = require('croxydb');
const fs = require('fs');
const client = new Client();
client.commands = new Collection();
client.db = data;
require('discord-buttons')(client);

client.on('ready', () => {
  console.log('bot hazir');
});

client.on('message', (message) => {
  let prefix = 'prefix';
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = client.commands.get(command);
  if (!cmd) return;
  cmd.run(client, message, args);
});

fs.readdir('./cmds/', (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    let cmd = require(`./cmds/${f}`);
      client.commands.set(cmd.name, cmd);
  });
});

client.login('token');
