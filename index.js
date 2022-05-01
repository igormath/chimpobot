import { Client, Intents, MessageEmbed } from 'discord.js'
import 'dotenv/config'
import ytdl from "ytdl-core-discord"
import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} from '@discordjs/voice'
import YouTube from 'youtube-sr'

// Controllers
import parseMessage from './src/controllers/ParseMessage/parse_message.mjs'
import playerMonitor from './src/controllers/PlayerMonitor/player_monitor.mjs'
import createConnection from './src/controllers/CreateConnection/create_connection.mjs'
import connectionMonitor from './src/controllers/ConnectionMonitor/connection_monitor.mjs'
import clearResults from './src/controllers/ClearResults/clear_results.mjs'
import chooseTeams from './src/controllers/ChooseTeams/choose-teams.mjs'

const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
})
const token = `${process.env.APPLICATION_TOKEN}`
bot.login(token)

var queue = []
var results = []
var tempResults = []

bot.on('ready', () => {
  bot.user.setActivity('Tarimba')
})

bot.on('messageCreate', async message => {
  const { author, content, guild, member } = message
  const { search, command } = parseMessage(content)

  if (command[0] != ';') {
    return
  }

  if (author.bot) {
    return
  }

  if (!member.voice.channel) {
    return message.reply('Entre em um canal de voz para poder chamar o Chimpa Tocador')
  }

  const player = createAudioPlayer()
  const channel = member.voice.channel
  const connection = createConnection(channel, guild)
  connectionMonitor(connection, player, queue)

  if (command === ';prox') {
    clearResults(tempResults)

    if (queue.length === 0) {
      return console.log('No more musics')
    }

    if (AudioPlayerStatus.Playing) {
      connection.subscribe(player)

      if (queue.length > 1) {
        queue.shift()
        const { song, message, resource } = queue[0]
        player.play(resource)
        message.reply(`Ta ta ta, próxima: ${song.title} (${song.durationFormatted})`)
      } else {
        player.stop()
        queue.shift()
      }

      playerMonitor(player, queue)
    }
  }

  if (command === ';toca') {
    if (!channel) {
      return console.log('Canal não foi encontrado.')
    }

    if (tempResults.length === 0) {
      tempResults = await YouTube.search(search)
      results = tempResults?.slice(0, 5) ?? []

      if (results.length === 0) {
        return message.reply('Nenhum resultado encontrado!')
      }

      const formattedResult = results.map(
        (result, index) => `${index + 1} - ${result.title} (${result.durationFormatted})`
      )
      return message.reply(formattedResult.join('\n'))
    }

    try {
      //  Search in this case is the result number
      const song = results[search - 1]
      if (!song) {
        tempResults = []
        results = []
        return message.reply('Comando inválido! Faça a busca novamente.')
      }

      const IDLE_STATE = AudioPlayerStatus.Idle || AudioPlayerStatus.AutoPaused
      const stream = await ytdl(`https://www.youtube.com/watch?v=${song.id}`, {
        highWaterMark: 1 << 25,
        filter: 'audioonly',
        format: 'mp3',
        quality: 'highestaudio'
      })
      const resource = createAudioResource(stream, { inputType: StreamType.Opus })

      if (queue.length === 0 && IDLE_STATE) {
        connection.subscribe(player)
        queue.push({ resource, message, song })
        player.play(resource)
        message.reply(`Lansei a braba: ${song.title} (${song.durationFormatted})`)
      } else if (AudioPlayerStatus.Playing) {
        queue.push({ resource, message, song })
        console.log('Added to queue: ', song.title)
        message.reply(`Essa braba foi pra fila: ${song.title} (${song.durationFormatted})`)
      }
      clearResults(tempResults)
      playerMonitor(player, queue)
    } catch (error) {
      queue = []
      connection.disconnect()
      console.log('Erro: ', error)
    }
  }

  if (command === ';ajuda') {
    clearResults(tempResults)

    const text =
      'No momento, possuo os seguintes comandos: \n\n`;toca <URL>` ou `;toca <termo-para-busca>`: Toca a música de uma URL ou retorna 5 resultados da busca pelo termo no youtube.\nUse `;toca <número-da-musica>` para tocar a música escolhida. \n\n`;prox`: Toca a próxima música da fila. O comando também serve para parar a música atual se a fila estiver vazia.\n\n`;tira`: Digite um número par de nomes após o comando para sortear estes em dois times diferentes.'
    return message.reply({ content: text, allowedMentions: { repliedUser: true } })
  }

  if (command === ';tira') {
    const teams = chooseTeams(search)
    message.reply(teams)
  }
})
