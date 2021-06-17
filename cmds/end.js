const { MessageEmbed } = require('discord.js');
const { MessageButton } = require('discord-buttons');

module.exports = {
  name: "end",
};

module.exports.run = async (client, message, args) => {
  let error = new MessageEmbed().setColor('RED').setTimestamp();
  if(!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.channel.send(error.setDescription(':x: You don\'t have permissions to use this command.'));
  };
  let gwId = args[0];
  if(!gwId) return message.channel.send(error.setDescription(':x: Please specify a Valid Giveaway Id!'));
  let Id = client.db.fetch(`gwEnd_${message.guild.id}`);
  if(!Id) return message.channel.send(error.setDescription(':x: There is not a valid giveaway!'))
  if(Id.key == gwId) {
    let channel = Id.channel;
    let key = client.db.fetch(`gwUsers_${message.guild.id}`);
    if(!key) {
      let gwEndedEmbed = new MessageEmbed()
      .setDescription(`:gift: Prize: **${Id.prize}**\n:joy: Winner(s): **No winners!**`)
      .setColor('BLURPLE')
      .setTimestamp()
      .setFooter('Ended at');
      return message.guild.channels.cache.get(channel).messages.cache.get(gwId).edit({ embed: gwEndedEmbed }).then(() => {
        client.db.delete(`gwEntry_${message.guild.id}`),
        client.db.set(`gwReroll_${message.guild.id}`, { Set: 2 });
        client.channels.cache.get(channel).send(`Not enough entrants to determine a winner!`)
      });
    } else {
      let winners = client.db.get(`gwUsers_${message.guild.id}`)[Math.floor(Math.random()*client.db.get(`gwUsers_${message.guild.id}`).length)];
      let gwEndedEmbed = new MessageEmbed()
      .setDescription(`:gift: Prize: **${Id.prize}**\n:joy: Winner(s): <@${winners}>`)
      .setColor('BLURPLE')
      .setTimestamp()
      .setFooter('Ended at');
      return message.guild.channels.cache.get(channel).messages.cache.get(gwId).edit({ embed: gwEndedEmbed }).then(() => {
        client.db.delete(`gwEntry_${message.guild.id}`),
        client.db.set(`gwReroll_${message.guild.id}`, { Set: 1 }),
        client.channels.cache.get(channel).send(`Congratulations <@${winners}>, you won the **${Id.prize}**!`);
      });
    };  
  } else {
    let embed2 = new MessageEmbed()
    .setDescription(':x: There is not giveaway according to the Id you specified!')
    .setColor('BLURPLE')
    .setTimestamp()
    .setFooter('Failed at');
    return message.channel.send(embed2);
  };
};