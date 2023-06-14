const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
const ChatModel = require("../models/Chats");
const MessagesModel = require("../models/Messages");
const httpStatus = require("../utils/httpStatus");
const {responseError, setAndSendResponse, callRes} = require("../utils/response_code");
const chatController = {};
chatController.createChat = async (req, res, next) => {
    try{
        let userId = req.userId;
        const {
            name,
            receivedId,
            member,
            type,
        } = req.body;
        let chat;
        if (type === PRIVATE_CHAT) {
            chat = new ChatModel({
                type: PRIVATE_CHAT,
                member: [
                    receivedId,
                    userId
                ],
                name: name
            });
            await chat.save();
            return callRes(res, responseError.OK, chat);
        } else if (type === GROUP_CHAT) {
            member.push(userId);
            chat = new ChatModel({
                type: GROUP_CHAT,
                member: member,
                name: name
            });
            await chat.save();
            return callRes(res, responseError.OK, chat);
        }              
    }
    catch(e){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
// chatController.send = async (req, res, next) => {
//     try {
//         let userId = req.userId;
//         const {
//             chatId,
//             type,
//             content
//         } = req.body;
//         let chatIdSend = null;
//         let chat;
//         if (type === PRIVATE_CHAT) {
//             if (chatId) {
//                 chat = await ChatModel.findById(chatId);
//                 if (chat !== null) {
//                     chatIdSend = chat._id;
//                 }
//             } else {
//                 return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "chatId");
//             }
//         } else if (type === GROUP_CHAT) {
//             if (chatId) {
//                 chat = await ChatModel.findById(chatId);
//                 if (chat !== null) {
//                     chatIdSend = chat._id;
//                 }
//             } else {
//                 return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "chatId");
//             }
//         } else {
//             return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "type");
//         }
//         if (chatIdSend) {
//             if (content) {
//                 let message = new MessagesModel({
//                     chat: chatIdSend,
//                     user: userId,
//                     content: content
//                 });
//                 await message.save();
                // await ChatModel.findByIdAndUpdate(chatIdSend, {
                //     lastMessage: content
                // })
//                 let messageNew = await MessagesModel.findById(message._id).populate('chat').populate('user');
//                 return res.status(httpStatus.OK).json({
//                     data: messageNew
//                 });
//             } else {
//                 return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "content");
//             }
//         } else {
//             return callRes(res, responseError.CHAT_IS_NOT_EXISTED);
//         }

//     } catch (e) {
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             message: e.message
//         });
//     }
// }

chatController.send = async (req, res, next) => {
    try {
        let userId = req.userId;
        const {
            name,
            chatId,
            receivedId,
            member,
            typeChat,
            content,
            typeMesage
        } = req.body;


        if (!content) {
            return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "content");
        }
        if (!typeMesage) {
            return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "typeMesage");
        }

        let chatIdSend = null;
        let chat;
        if (typeChat === PRIVATE_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                } else {
                    return callRes(res, responseError.CHAT_IS_NOT_EXISTED);
                }
            } else {
                if (!receivedId){
                    return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "receivedId");
                }
                chat = new ChatModel({
                   type: PRIVATE_CHAT,
                   member: [
                       receivedId,
                       userId
                   ],
                   name: name
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        } else if (typeChat === GROUP_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                } else {
                    return callRes(res, responseError.CHAT_IS_NOT_EXISTED);
                }
            } else {
                if (!member){
                    return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "member");
                }
                member.push(userId);
                chat = new ChatModel({
                    type: GROUP_CHAT,
                    member: member,
                    name: name
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        }else{
            return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "typeChat");
        }

        let message = new MessagesModel({
            chat: chatIdSend,
            user: userId,
            content: content,
            type: typeMesage
        });

        await message.save();
        await ChatModel.findByIdAndUpdate(chatIdSend, {
            lastMessage: message._id
        });
        let messageNew = await MessagesModel.findById(message._id).populate('chat').populate('user');
        return res.status(httpStatus.OK).json({
            data: messageNew
        });

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

chatController.getMessages = async (req, res, next) => {
    try {
        let messages = await MessagesModel.find({
            chat: req.params.chatId
        }).populate('user');
        return res.status(httpStatus.OK).json({
            data: messages
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

chatController.getMessaged = async(req, res, next) => {
    let userId = req.query.userId;
    // console.log("req: ",req);
    let listChats = await ChatModel.find({"member": {$all: [userId]}});
    let listMessages = await MessagesModel.find({"chat": {$in: listChats}}).populate('chat').populate('user');

    console.log("listChats: ",listChats);
    console.log("listMessages: ",listMessages);
    let map = new Map();
    for(let message of listMessages){
        let key = message.chat.toString();
        
        if(map.has(key)){
            if(map.get(key).updatedAt < message.updatedAt){
                map.set(key, message);
            } 
        } else {
            map.set(key, message);
        }
    }
    
    let result = [];
    for(let [key, value] of map){
        result.push(value);
    }

    return res.status(httpStatus.OK).json({
        data: result,
        message: 'Get list success',
        response: 'GET LIST SUCCESS'
    });
}

module.exports = chatController;