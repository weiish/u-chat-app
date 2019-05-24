const client = io()


const messageForm = document.querySelector('#messageForm')
const messageInputText = document.querySelector('#chatInput')

client.on('countUpdated', (count) => {
    console.log('Count: ', count)
})

client.on('message', (message) => {
    console.log(message)
})

messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = messageInputText.value
    client.emit('sendMessage', message)
    messageInputText.value = ""
})