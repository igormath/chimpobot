require('dotenv').config()
const { Client, Intents } = require('discord.js')
const ytdl = require('ytdl-core-discord')
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require('@discordjs/voice')
const ytsearch = require('youtube-sr')

const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
})
const token = `${process.env.APPLICATION_TOKEN}`
bot.login(token)
var queue = []

function parseMessage(content) {
  const message = content.toLowerCase().split(' ')
  const command = message.shift()
  const search = message.join(' ')

  return { command, search }
}

function playerMonitor(player) {
  player.on(AudioPlayerStatus.Idle, () => console.log('Player status: IDLE'))
  player.on(AudioPlayerStatus.Buffering, () => console.log('Player status: BUFFERING'))
  player.on(AudioPlayerStatus.Playing, () => console.log('Player status: PLAYING\nIn queue: ', queue.length - 1))
  player.on(AudioPlayerStatus.Paused, () => console.log('Player status: PAUSED'))
  player.on(AudioPlayerStatus.AutoPaused, () => console.log('Player status: AUTOPAUSED'))
}

function createConnection(channel, guild) {
  return joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator
  })
}

bot.on('messageCreate', async message => {
  const { author, content, guild, member } = message
  const { search, command } = parseMessage(content)

  if (author.bot) {
    return
  }

  if (command === ';toca') {
    if (!member.voice.channel) {
      return message.reply('Entre em um canal de voz para poder chamar o Chimpa Tocador')
    }

    const channel = member.voice.channel
    const connection = createConnection(channel, guild)
    const song = await ytsearch.YouTube.searchOne(search)

    if (!channel) {
      return console.log('Canal não foi encontrado.')
    }

    try {
      const IDLE_STATE = AudioPlayerStatus.Idle || AudioPlayerStatus.AutoPaused
      const stream = await ytdl(`https://www.youtube.com/watch?v=${song.id}`, {
        highWaterMark: 1 << 25,
        filter: 'audioonly',
        format: 'mp3',
        quality: 'highestaudio'
      })
      const player = createAudioPlayer()
      const resource = createAudioResource(stream, { inputType: StreamType.Opus })

      if (queue.length === 0 && IDLE_STATE) {
        connection.subscribe(player)
        queue.push(resource)
        player.play(resource)
        message.reply(`Lansei a braba: ${song.title} (${song.durationFormatted})`)
      } else if (AudioPlayerStatus.Playing) {
        queue.push(resource)
        message.reply(`Essa braba foi pra fila: ${song.title} (${song.durationFormatted})`)
      }

      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Player status: IDLE')
        if (queue.length === 0) {
          return
        }

        queue.shift()
        if (queue.length > 0) {
          player.play(queue[0])
          message.reply(`Lansei a braba: ${song.title} (${song.durationFormatted})`)
        }
      })

      playerMonitor(player)
    } catch (error) {
      queue = []
      connection.disconnect()
      console.log('Erro: ', error)
    }
  }
})
