const express = require("express");
const usersRoutes = require("../Users");
const chatsRoutes = require("../Chats");
const friendsRoutes = require("../Friends");

const apiRoutes = express.Router();

apiRoutes.use("/users", usersRoutes);
apiRoutes.use("/chats", chatsRoutes);
apiRoutes.use("/friends", friendsRoutes);


apiRoutes.get(
    "/", (req, res) => res.json({ api: "is-working" })
);
module.exports = apiRoutes;