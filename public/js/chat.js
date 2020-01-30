const socket = io()

// Elements
const $messages = document.querySelector('#messages')
const $messageForm = document.querySelector('#message_form')
const $messageInput = document.querySelector('#message_input')
const $messageSendButton = document.querySelector('#message_submit')
const $sendLocationButton = document.querySelector('#send_location')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  // New message eleement
  const $newMessage = $messages.lastElementChild
  // Height of new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  // Visible height
  const visibleHeight = $messages.offsetHeight
  // Height of messages container
  const containerHeight = $messages.scrollHeight
  // How far, have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}
// Message Input Form //
$messageForm.addEventListener('submit', e => {
  e.preventDefault()
  $messageSendButton.setAttribute('disabled', 'disabled')
  // Type, Content, Callback/Acknowledgement
  socket.emit('send_message', $messageInput.value, error => {
    $messageSendButton.removeAttribute('disabled')
    $messageForm.reset()
    $messageInput.focus()
    if (error) return console.log(error)
    console.log('The message was delivered')
  })
})
// Message Recieve and Display //
socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm:ss a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('location_message', url => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm:ss a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('room_data', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room.toUpperCase(),
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

// User Joins Chat //
socket.on('new_user', newMsg => console.log(newMsg))

// GEOLOCATION //
$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('send_location', { lat: position.coords.latitude, lon: position.coords.longitude }, () => {
      console.log('Location Shared')
      $sendLocationButton.removeAttribute('disabled')
    })
  })
})

socket.emit('join', { username, room }, error => {})
