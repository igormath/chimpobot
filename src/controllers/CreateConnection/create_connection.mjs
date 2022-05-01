import { joinVoiceChannel } from "@discordjs/voice"

export default function createConnection(channel, guild) {
    return joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    })
}
