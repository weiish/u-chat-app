const client = io()


const $messageForm = document.querySelector('#message-form')
const $messageInputText = document.querySelector('#chatInput')
const $messageButton = document.querySelector('#sendMessageButton')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-message-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

client.on('countUpdated', (count) => {
    console.log('Count: ', count)
})

client.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        text: message.text,
        createdAt: moment(message.createdAt).format("h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

client.on('location', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        location: location.url,
        createdAt: moment(location.createdAt).format("h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageButton.disabled = true
    const message = $messageInputText.value
    client.emit('sendMessage', message, (message) => {
        $messageButton.disabled = false
        console.log('The message was delivered')
    })
    $messageInputText.value = ""
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.disabled = true
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser')
        return
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        let latlontime = {latitude: position.coords.latitude, longitude: position.coords.longitude, createdAt: position.timestamp}
        client.emit('sendLocation', latlontime, (acknowledgement) => {
            console.log(acknowledgement)
            $sendLocationButton.disabled = false
        })
    })
})

client.emit('join', {username, room})