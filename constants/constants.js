require('dotenv').config();

// User Model


// gender
const GENDER_MALE = 'Nam';
const GENDER_FEMALE = 'Nữ';
const GENDER_SECRET = 'Bí ẩn';

// Chats Model
const PRIVATE_CHAT = 'PRIVATE_CHAT';
const GROUP_CHAT = 'GROUP_CHAT';
const TEXT = 'TEXT';
const IMAGE = 'IMAGE';

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
module.exports = {
    GENDER_MALE,
    GENDER_FEMALE,
    GENDER_SECRET,
    PRIVATE_CHAT,
    GROUP_CHAT,
    TEXT,
    IMAGE,
    JWT_SECRET,
    MONGO_URI,
    PORT
}