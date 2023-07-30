const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
const FriendModel = require("../models/Friends");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const {ROLE_CUSTOMER} = require("../constants/constants");
const friendsController = {};

// 0: gửi lời mời
// 1: kết bạn
// 2: từ chối
// 3: hủy kết bạn

friendsController.setRequest = async (req, res, next) => {
    try {
        let sender = req.userId;
        let receiver = req.body.user_id;
        let checkBack = await FriendModel.findOne({ sender: receiver, receiver: sender });
        if (checkBack != null) {
            if (checkBack.status == '0' || checkBack.status == '1') {
                return res.status(200).json({
                    code: 200,
                    status: 'error',
                    success: false,
                    message: "Đối phương đã gửi lời mời kết bạn hoặc đã là bạn",
                });
            }
            checkBack.status = '0';

        }

        let isFriend = await FriendModel.findOne({ sender: sender, receiver: receiver });
        if(isFriend != null){
            if (isFriend.status == '1') {
                return res.status(200).json({
                    code: 200,
                    success: false,
                    message: "Đã gửi lời mời kết bạn trước đó",
                });
            }

            isFriend.status = '0';
            isFriend.save();
            res.status(200).json({
                code: 200,
                message: "Gửi lời mời kết bạn thành công",
            });

        }else{
            let status = 0;
            const makeFriend = new FriendModel({ sender: sender, receiver: receiver, status: status });
            makeFriend.save();
            res.status(200).json({
                code: 200,
                message: "Gửi lời mời kết bạn thành công",
                data: makeFriend
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
friendsController.deleteRequest  = async (req, res, next) => {
    try {
        
        let sender = req.userId;
        let receiver = req.body.receiver;
        let filter = { sender: sender, receiver: receiver , status: "0"};
        // console.log("filter: " + filter.receiver);
        const result = await FriendModel.deleteMany(filter);
        // console.log("result: "+result);
        // console.log("deletedCount: "+result.deletedCount);
        if(result.acknowledged && result.deletedCount > 0 ){
            res.status(200).json({
                code: 200,
                message: "Xóa thành công"
            });
        }else{
            res.status(404).json({
                code: 404,
                message: "Không tìm thấy"
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }

}
friendsController.getSendRequest  = async (req, res, next) => {
    try {
        let sender = req.userId;
        let requested = await FriendModel.find({sender: sender, status: "0" }).distinct('receiver')
        let users = await UserModel.find().where('_id').in(requested).exec()
   
        res.status(200).json({
            code: 200,
            message: "Danh sách lời mời đã gửi",
            data: users
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }

}

friendsController.getRequest = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let requested = await FriendModel.find({receiver: receiver, status: "0" }).distinct('sender')
        let users = await UserModel.find().where('_id').in(requested).exec()
   
        res.status(200).json({
            code: 200,
            message: "Danh sách lời mời kết bạn",
            data: users
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setAccept = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let sender = req.body.user_id;

        let friend = await FriendModel.findOne({ sender: sender, receiver: receiver });

        if (req.body.is_accept != '1' && req.body.is_accept != '2') {
            res.status(200).json({
                code: 200,
                message: "Không đúng yêu cầu",
                data: friend,
                success: false
            });
        }
        if (friend.status == '1' && req.body.is_accept == '2') {
            res.status(200).json({
                code: 200,
                message: "Không đúng yêu cầu",
                data: friend,
                success: false

            });
        }

        friend.status = req.body.is_accept;
        friend.save();
        let mes;
        if (req.body.is_accept === '1') {
            mes = "Kết bạn thành công";
        } else {
            mes = "Từ chối thành công";
        }

        res.status(200).json({
            code: 200,
            message: mes,
            data: friend,
            success: true,

        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setRemoveFriend = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let sender = req.body.user_id;

        let friendRc1 = await FriendModel.findOne({ sender: sender, receiver: receiver });
        let friendRc2 = await FriendModel.findOne({ sender: receiver, receiver: sender });
        let final;
        if (friendRc1 == null) {
            final = friendRc2;
        } else {
            final = friendRc1;
        }
        if (final.status != '1') {
            res.status(200).json({
                code: 200,
                success: false,
                message: "Không thể thao tác",
            });
        }

        final.status = '3';
        final.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: "Xóa bạn thành công",
            data: final
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.listFriends = async (req, res, next) => {
    try {
        if (req.body.user_id == null) {
            let requested = await FriendModel.find({sender: req.userId, status: "1" }).distinct('receiver')
            let accepted = await FriendModel.find({receiver: req.userId, status: "1" }).distinct('sender')

            let users = await UserModel.find().where('_id').in(requested.concat(accepted)).exec()

            res.status(200).json({
                code: 200,
                message: "Danh sách bạn bè",
                data: users
                
            });
        }

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.getStatusFriend = async (req, res, next) => {
    try {
        
        let m = req.userId;
        console.log("userId: " + m);
        let y = req.body.receiver;
        let filter1 = { sender: m, receiver: y};
        let filter2 = { sender: y, receiver: m };
        // console.log("filter: " + filter.receiver);
        let result = await FriendModel.findOne(filter1).populate("sender", "_id username avatar").populate("receiver", "_id username avatar");
        if(result == null){
            result = await FriendModel.findOne(filter2).populate("sender", "_id username avatar").populate("receiver", "_id username avatar");
        }
        
        // console.log("result: "+result);
        // console.log("deletedCount: "+result.deletedCount);
        if(result != null){
            
            res.status(200).json({
                code: 200,
                message: "Trạng thái bạn bè",
                status: result.status,
                me : result.sender._id == m ? result.sender : result.receiver,
                you : result.sender._id == y ? result.sender : result.receiver
            });
            
        }else{
            let me = await UserModel.findById(m);
            // Lọc bớt một số thuộc tính
            const filteredMe = {
                _id: me._id,
                username: me.username,
                avatar: me.avatar
                // Thêm các thuộc tính khác bạn muốn giữ lại ở đây
            };
            
            // console.log(filteredMe);
            let you = await UserModel.findById(y);
            // Lọc bớt một số thuộc tính
            const filteredYou = {
                _id: you._id,
                username: you.username,
                avatar: you.avatar
                // Thêm các thuộc tính khác bạn muốn giữ lại ở đây
            };
            res.status(200).json({
                code: 200,
                message: "Trạng thái bạn bè",
                status: "0",
                me: filteredMe,
                you : filteredYou
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
module.exports = friendsController;