const socket = io();

// --> Selecting essential elements from the DOM
const $messageForm = document.querySelector('#form');
const $messageFormInput = $messageForm.querySelector('#messageInput');
const $messageFormButton = $messageForm.querySelector('#sendBtn');
const $locationButton = document.querySelector('#locationBtn');
const $messages = document.querySelector('#messages');

// --> Selecting templates from the DOM
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// --> Options for parsing the query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// --> Defining function for autoscroll  
const autoscroll = () => {
  // Selecting the new message element
  const $newMessage = $messages.lastElementChild;

  // Checking the height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of the messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}

// --> Rendering messages through Event Handlers and Mustache template Engine
socket.on('message', (message) => {          // Text message
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,          // ES6 shorthand property
    createdAt: moment(message.createdAt).format('h:mm a Do MMM YYYY')          // Formatting time through moment JS library
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('locationMessage', (url) => {          // Location message
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector('#sidebar').innerHTML = html;
});

// --> Event Listeners
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');          // Disabling button

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');          // Re-enabling button
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $locationButton.setAttribute('disabled', 'disabled');          // Disabling button

  navigator.geolocation.getCurrentPosition((location) => {
    socket.emit('sendLocation', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    }, () => {          // Registering the message Acknowledgement from backend
      $locationButton.removeAttribute('disabled');          // Re-enabling button
      console.log('Location shared!');
    });
  });
});

// --> Emitting the Username and the room ID of the joined user
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});