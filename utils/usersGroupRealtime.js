const users = [];
const userOnline = [];

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
function userOn(id, userId){
  const user = { id, userId};

  // Sử dụng find()
  const foundUser = userOnline.find(u => u.userId === user.userId);
  if (foundUser) {
    console.log("numOfUserOnline:",userOnline.length);
    return null;
  } else {
    userOnline.push(user);
    console.log("numOfUserOnline:",userOnline.length);
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

// Get socketId user
function getSocketUser(userId) {
  const user =  userOnline.find(user => user.userId === userId);
  if (user ) {
    return user.id;
  }else return null;  
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
  userOn,
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getSocketUser
};