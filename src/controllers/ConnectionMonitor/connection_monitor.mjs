export default function connectionMonitor(connection, player, queue) {
    connection.on('disconnected', () => {
        console.log('\nClearing queue...')
        queue = []
        player.stop()
        player.removeAllListeners()
        console.log('Disconnected\n')
    })
}
