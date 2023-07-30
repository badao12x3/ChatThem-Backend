const chatController = require("../controllers/Chats");
const {asyncWrapper} = require("../utils/asyncWrapper");
const express = require("express");
const chatsRoutes = express.Router();
const auth = require("../middlewares/auth");

chatsRoutes.post(
    "/send",
    auth,
    asyncWrapper(chatController.send),
);

chatsRoutes.post(
    "/createChat",
    auth,
    asyncWrapper(chatController.createChat),
);

chatsRoutes.get(
    "/getMessages/:chatId",
    auth,
    asyncWrapper(chatController.getMessages),
);

chatsRoutes.get(
    "/getMessaged",
    auth,
    asyncWrapper(chatController.getMessaged),
);

chatsRoutes.get(
    "/findChat",
    auth,
    asyncWrapper(chatController.findChat),
);
chatsRoutes.get(
    "/getMember",
    auth,
    asyncWrapper(chatController.getMember),
);
module.exports = chatsRoutes;