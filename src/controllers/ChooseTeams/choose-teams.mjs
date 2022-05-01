export default function chooseTeams(searchMessage) {
    const resultsArray = searchMessage.split(', '), size = resultsArray.length
    let team1 = [], team2 = [], returnedMessage = ''

    if (size % 2 !== 0) {
        returnedMessage = ('O total de jogadores informado deve ser par!')
    } else {
        let currentIndex = size, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
            [resultsArray[currentIndex], resultsArray[randomIndex]] = [resultsArray[randomIndex], resultsArray[currentIndex]]
        }

        resultsArray.forEach((value, index) => {
            if (index < (size / 2)) {
                team1.push(value)
            } else {
                team2.push(value)
            }
        })
        returnedMessage = (`Time 1: ${team1}\nTime 2: ${team2}`)
    }
    return returnedMessage
}
