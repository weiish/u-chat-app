const client = io()

const $messageForm = document.querySelector('#message-form')
const $messageInputText = document.querySelector('#chatInput')
const $messageButton = document.querySelector('#sendMessageButton')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageStyles)
}

client.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        userName: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format("h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


client.on('location', (location) => {
    const html = Mustache.render(locationTemplate, {
        userName: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format("h:mm:ss a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

client.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageButton.disabled = true
    const message = $messageInputText.value
    client.emit('sendMessage', message, (error) => {
        $messageButton.disabled = false
        if (error) {
            alert('There was an error with your username')
            location.href = '/'
        }
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
        let latlontime = {latitude: position.coords.latitude, longitude: position.coords.longitude, createdAt: position.timestamp}
        client.emit('sendLocation', latlontime, (acknowledgement) => {
            $sendLocationButton.disabled = false
        })
    })
})

client.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})