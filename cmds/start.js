const { MessageEmbed } = require('discord.js');
const { MessageButton } = require('discord-buttons');
const moment = require('moment');
const ms = require('ms');

module.exports = {
  name: "start",
}

module.exports.run = async (client, message, args) => {
  let error = new MessageEmbed().setColor('RED').setTimestamp();
  if(!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.channel.send(error.setDescription(':x: You don\'t have permissions to use this command.'));
  };
  let time = args[0];
  let winnersCount = args[1];
  let prize = args.slice(2).join(" ");
  if(!time) return message.channel.send(error.setDescription(':x: Please specify a time!'));
  if(!winnersCount) return message.channel.send(error.setDescription(':x: Please specify a winner(s) count!'));
  if(!prize) return message.channel.send(error.setDescription(':x: Please specify a prize!'));
  let gwTime = ms(time);
  let gwEmbed = new MessageEmbed()
  .setDescription(`:gift: Prize: **${prize}**\n:joy: Winner(s) Count: **${winnersCount}**\n:eyes: Time: **[Click!](https://timer.lunarisx.com/premium-view.html?start=${Date.now()}&length=36000000)**`)
  .setColor('BLURPLE')
  .setTimestamp()
  .setFooter('Started at');
  let embedButton = new MessageButton()
  .setStyle('blurple')
  .setLabel('Enter')
  .setEmoji('🎉')
  .setID('gwButton');
  let msg = await message.channel.send({ buttons: [embedButton], embed: gwEmbed }).then(me => {
    let channelId = message.channel.id;
    let msgId = me.id;
    client.db.set(`gwEnd_${message.guild.id}`, { key: msgId, prize: prize, channel: channelId });
    async function edit() {
      let winners = client.db.get(`gwUsers_${message.guild.id}`)[Math.floor(Math.random()*client.db.get(`gwUsers_${message.guild.id}`).length)];
      let gwEndedEmbed = new MessageEmbed()
      .setDescription(`:gift: Prize: **${prize}**\n:joy: Winner(s): <@${winners}>`)
      .setColor('BLURPLE')
      .setTimestamp()
      .setFooter('Ended at');
      me.edit({ embed: gwEndedEmbed }).then(() => {
        client.db.delete(`gwEntry_${message.guild.id}`),
        client.channels.cache.get(channelId).send(`Congratulations <@${winners}>, you won the **${prize}**!`)
      })
    }
    async function lockGw() {
      let gwEndedEmbed1 = new MessageEmbed()
      .setDescription(`:gift: Prize: **${prize}**\n:joy: Winner(s): **No winners!**`)
      .setColor('BLURPLE')
      .setTimestamp()
      .setFooter('Ended at');
      me.edit({ embed: gwEndedEmbed1 }).then(() => {
        client.db.delete(`gwEntry_${message.guild.id}`),
        client.channels.cache.get(channelId).send(`Not enough entrants to determine a winner!`)
      })
    }
    message.delete();
    let filter = m => m.clicker.user.id !== client.user.id;
    let cl = me.createButtonCollector(filter);
    cl.on('collect', async (button) => {
      button.defer()
      if (button.id == "gwButton") {
        let userId = button.clicker.user.id;
        client.users.cache.get(userId).send('You successfully entry the giveaway with name **'+prize+'**')
        client.db.push(`gwUsers_${message.guild.id}`, userId)
      };
    });
    setTimeout(function() {
      let g = client.db.fetch(`gwUsers_${message.guild.id}`);
      if(!g) {
        lockGw()
        client.db.set(`gwReroll_${message.guild.id}`, { Set: 2 });
      } else {
        edit()
        client.db.set(`gwReroll_${message.guild.id}`, { Set: 1 });
      };
    }, gwTime);
  });
}