export default function parseMessage(content) {
    const message = content.toLowerCase().split(' ')
    const command = message.shift()
    const search = message.join(' ')

    return { command, search }
}
