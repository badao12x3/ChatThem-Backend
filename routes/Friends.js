const friendController = require("../controllers/Friends");
const {asyncWrapper} = require("../utils/asyncWrapper");
const express = require("express");
const friendsRoutes = express.Router();
const ValidationMiddleware = require("../middlewares/validate");
const auth = require("../middlewares/auth");

friendsRoutes.post("/list", auth, friendController.listFriends);
friendsRoutes.post("/set-request-friend", auth, friendController.setRequest);
friendsRoutes.get("/get-requested-friend", auth, friendController.getRequest);
friendsRoutes.post("/set-accept", auth, friendController.setAccept);
friendsRoutes.post("/set-remove", auth, friendController.setRemoveFriend);
friendsRoutes.post("/get-send-request", auth, friendController.getSendRequest);
friendsRoutes.post("/delete-request", auth, friendController.deleteRequest);
friendsRoutes.post("/get-status-friend", auth, friendController.getStatusFriend);

module.exports = friendsRoutes;