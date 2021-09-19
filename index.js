const { Client, Intents } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const ytdl = require('ytdl-core');

const token = '';
bot.login(token);

bot.on('messageCreate', msg => {
  const { author, content, guild } = msg;

  if (author.bot) {
    return;
  }

  if (content.toLowerCase().startsWith(';toca')) {
    const VoiceChannel = guild.channels.cache.find(channel => channel.id === '');

    if (!VoiceChannel) {
      return console.log('Canal não foi encontrado.');
    }

    VoiceChannel.join()
      .then(connection => {
        const stream = ytdl('https://www.youtube.com/watch?v=KW4m13ZhVDA', { filter: 'audioonly' });

        const Player = connection.playStream(stream, { seek: 0, volume: 1 });
        Player.on('end', _ => {
          console.log('acabou!');
        });
      })
      .catch(e => console.log('Erro: ', e));

  }
});