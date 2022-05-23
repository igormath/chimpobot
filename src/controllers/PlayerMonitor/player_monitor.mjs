import { AudioPlayerStatus } from "@discordjs/voice"

export default function playerMonitor(player, queue) {
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('Player status: IDLE\n')
        if (queue.length === 0) {
            return
        }

        queue.shift()
        if (queue.length > 0) {
            const { song, message, resource } = queue[0]

            player.play(resource)
            message.reply(`Lansei a braba: ${song.title} (${song.durationFormatted})`)
        }
    })

    player.on(AudioPlayerStatus.Playing, () => console.log(`Player status: PLAYING\nIn queue: ${queue.length - 1}\n`))
    player.on(AudioPlayerStatus.Buffering, () => console.log('Player status: BUFFERING\n'))
    player.on(AudioPlayerStatus.Paused, () => console.log('Player status: PAUSED\n'))
    player.on(AudioPlayerStatus.AutoPaused, () => console.log('Player status: AUTOPAUSED\n'))
}
