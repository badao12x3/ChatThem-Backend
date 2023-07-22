// import {
//     PRIVATE_CHAT, GROUP_CHAT
// }  from '../constants/constants.js';

// import { Schema, model } from "mongoose";

const {
    PRIVATE_CHAT,
    GROUP_CHAT,
    TEXT,
    IMAGE
} = require('../constants/constants');
const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    member: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages"
    },
    type: {
        type: String,
        enum: [
            PRIVATE_CHAT,
            GROUP_CHAT,
        ],
        required: false,
        default: PRIVATE_CHAT
    },
    seen: [
        {
            memberId : {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            seen: {
                type : String,
                require: false,
                default: "0"
            }
        }
    ],
    avatar: {
        type: String,
        required: false
    }
});
chatsSchema.set('timestamps', true);
module.exports = mongoose.model('Chats', chatsSchema);