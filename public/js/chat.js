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
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: message.createdAt
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('location_message', url => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    url
  })
  $messages.insertAdjacentHTML('beforeend', html)
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
