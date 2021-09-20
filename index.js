const { Client, Intents } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const ytdl = require('ytdl-core-discord');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytsearch = require('youtube-sr')

const token = '';
bot.login(token);

function parseMessage(content) {
  const message = content.toLowerCase().split(' ')
  const command = message.shift()
  const search = message.join(' ')

  return { command, search }
}

function playerMonitor(player) {
  player.on(AudioPlayerStatus.Idle, () => console.log('idle'))
  player.on(AudioPlayerStatus.Buffering, () => console.log('buff'))
  player.on(AudioPlayerStatus.Playing, () => console.log('playing'))
  player.on(AudioPlayerStatus.Paused, () => console.log('paused'))
  player.on(AudioPlayerStatus.AutoPaused, () => console.log('autopaused'))
}

async function createPlayer(connection, content) {
  const player = createAudioPlayer();
  const resource = createAudioResource(content)
  const subscription = await connection.subscribe(player)

  return { player, resource, subscription }
}

function createConnection(channel, guild) {
  return joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator
  })
}

bot.on('messageCreate', async message => {
  const { author, content, guild, member } = message;
  const { search, command } = parseMessage(content)

  if (author.bot) {
    return;
  }

  if (command === ';toca') {
    const channel = member.voice.channel
    const connection = createConnection(channel, guild)
    const song = await ytsearch.YouTube.searchOne(search)

    if (!channel) {
      return console.log('Canal não foi encontrado.');
    }

    const options = { filter: 'audioonly' }
    const stream = await ytdl(`https://www.youtube.com/watch?v=${song.id}`, options);

    // Play
    const { player, resource } = await createPlayer(connection, stream)
    player.play(resource)
    message.reply(`Lansei a braba: ${song.title} (${song.durationFormatted})`)

    // Monitor
    playerMonitor(player)
  }
});