const users = [];

// Join user to chat
function userJoin(id, userId, username, avatar, room,typeRoom, publicKey) {
  const user = { id, userId, username, avatar, room, typeRoom, publicKey};

  // Sử dụng find()
  const foundUser = users.find(u => u.userId === user.userId && u.room === user.room);
  if (foundUser) {
    console.log("numOfUser:",users.length);
    return null;
  } else {
    users.push(user);
    console.log("numOfUser:",users.length);
    return user;
  }
}
function userLeave(id, username, room){
  const index = users.findIndex(user => user.id === id && user.room == room);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get current user
function getCurrentUser(id, room) {
  return users.find(user => user.id === id && user.room == room);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};