const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
const ChatModel = require("../models/Chats");
const MessagesModel = require("../models/Messages");
const UsersModel = require("../models/Users");
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
                // chat = await ChatModel.findById(chatId);
                // if (chat !== null) {
                //     chatIdSend = chat._id;
                // } else {
                //     return callRes(res, responseError.CHAT_IS_NOT_EXISTED);
                // }
                chatIdSend = chatId;
            } else {
                if (!receivedId){
                    return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH, "receivedId");
                }
                chat = new ChatModel({
                   type: PRIVATE_CHAT,
                   member: [
                       receivedId,
                       userId
                   ]
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        } else if (typeChat === GROUP_CHAT) {
            if (chatId) {
                // chat = await ChatModel.findById(chatId);
                // if (chat !== null) {
                //     chatIdSend = chat._id;
                // } else {
                //     return callRes(res, responseError.CHAT_IS_NOT_EXISTED);
                // }
                chatIdSend = chatId;
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

        // let msg = {
        //     chat: chatIdSend,
        //     user: userId,
        //     content: content,
        //     type: typeMesage
        // };

        // var msgg = await MessagesModel.create(msg);

        // msgg = await msgg.populate('chat',"_id").populate('user',"_id");

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
        let messageNew;
        if (!chatId){
            messageNew = await MessagesModel.findById(message._id).populate('chat',"_id type name avatar member").populate('user',"_id avatar username public_key online").lean();
            if (typeChat === PRIVATE_CHAT) {
                let receiver = await UsersModel.findById(receivedId);
                // console.log(receiver)
                messageNew.chat.name = receiver.username;
                messageNew.chat.avatar = receiver.avatar; 
            }
        }else{
            messageNew = await MessagesModel.findById(message._id).populate('chat',"_id type ").populate('user',"_id avatar username public_key online");
        }
        
        return callRes(res, responseError.OK, messageNew);


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

chatController.findChat = async (req, res, next) => {

    let userId1 = req.query.userId1;
    let userId2 = req.query.userId2;

    if(!userId1 || !userId2){
        callRes(res,responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    
    try {
        let chat = await ChatModel.findOne({ member: { $all: [userId1,userId2], $size: 2}});
        if(chat){
            callRes(res, responseError.OK, chat);
        }else{
            callRes(res, responseError.CHAT_IS_NOT_EXISTED);
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
chatController.getMember = async (req, res, next) => {

    let chatId = req.query.chatId;

    if(!chatId){
        callRes(res,responseError.PARAMETER_IS_NOT_ENOUGH);
    }
    
    try {
        let chat = await ChatModel.findById(chatId).populate("member", "_id username avatar" );
        if(chat){
            callRes(res, responseError.OK, chat.member);
        }else{
            callRes(res, responseError.CHAT_IS_NOT_EXISTED);
        }
        
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
chatController.getMessaged = async(req, res, next) => {
    let userId = req.userId;
    // console.log("req: ",req);
    let listChats = await ChatModel.find({"member": {$all: [userId]}}).populate({
        path: 'lastMessage',
        populate: { path: 'user' }
    })
    .sort({ 'lastMessage.updatedAt': 1 }) // Sắp xếp theo trường "updatedAt" trong "lastMessage" giảm dần
    .lean();


    let result = [];
    for(let chat of listChats){
        if(chat.type == "PRIVATE_CHAT"){
            for(let i = 0; i < 2; i++){
                if(chat.member[i] != userId){
                    chat.receivedId = chat.member[i];
                    break;
                }
            }
            let receiver = await UsersModel.findById(chat.receivedId);
            chat.name = receiver.username;
            chat.avatar = receiver.avatar;
            chat.online = receiver.online ? receiver.online : "0";
        }else{
            let member = chat.member;
            let is_online = false;
            for(let i = 0; i < member.length - 1; i++){
                let mem = await UsersModel.findById(member[i]);
                if(mem.online){
                    if(mem.online == "1") {
                        is_online = true;
                        break;
                    }
                }
            }
            if(is_online == "1"){
                chat.online = "1";
            }else chat.online = "0";
            if (!chat.avatar){
                chat.avatar = "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";
            }
        }
        result.push(chat);
    }


    
    // let listMessages = await MessagesModel.find({"chat": {$in: listChats}}).populate('chat').populate('user');

    // console.log("listChats: ",listChats);
    // console.log("listMessages: ",listMessages);
    // let map = new Map();
    // for(let message of listMessages){
    //     let key = message.chat.toString();
        
    //     if(map.has(key)){
    //         if(map.get(key).updatedAt < message.updatedAt){
    //             map.set(key, message);
    //         } 
    //     } else {
    //         map.set(key, message);
    //     }
    // }
    
    // let result = [];
    // for(let [key, value] of map){
    //     result.push(value);
    // }

    return res.status(httpStatus.OK).json({
        data: result,
        message: 'Get list success',
        code: '200'
    });
}

module.exports = chatController;