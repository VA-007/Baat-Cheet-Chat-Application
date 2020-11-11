const users = [];

// Functions here --> addUser()  removeUser()  getUser()  getUsersInRoom()

const addUser = ({ id, username, room }) => {
  // Cleaning the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and Room ID are mandatory!'
    }
  }

  // Checking existing user
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  // Validating username  
  if (existingUser) {
    return {
      error: 'Username already taken! Try again with a different username.'
    }
  }

  const user = { id, username, room }
  users.push(user);

  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) { 
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => {
  return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room);
}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}