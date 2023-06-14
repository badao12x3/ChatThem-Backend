const mongoose = require("mongoose");
const {
    TEXT,
    IMAGE,
} = require('../constants/constants');
const messagesSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chats"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    content: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: [
            TEXT,
            IMAGE,
        ],
        required: true,
        default: TEXT
    }
});
messagesSchema.set('timestamps', true);
module.exports = mongoose.model('Messages', messagesSchema);