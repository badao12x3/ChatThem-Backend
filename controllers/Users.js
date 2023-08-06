const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
// const DocumentModel = require("../models/Documents");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const { callRes, responseError } = require("../utils/response_code");
// const uploadFile = require('../functions/uploadFile');
const usersController = {};

usersController.register = async (req, res, next) => {
    try {
        const {
            phonenumber,
            password,
            username,
            avatar,
            publicKey
        } = req.body;

        let user = await UserModel.findOne({
            phonenumber: phonenumber
        })

        if (!publicKey){
            
        }

        if (user) {
            return callRes(res, responseError.PHONE_EXISTED)
        }
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new UserModel({
            phonenumber: phonenumber,
            password: hashedPassword,
            username: username,
            avatar: avatar,
            public_key: publicKey
        });

        try {
            const savedUser = await user.save();

            // login for User
            // create and assign a token
            const token = jwt.sign(
                {username: savedUser.username, firstName: savedUser.firstName, lastName: savedUser.lastName, id: savedUser._id, publicKey: savedUser.public_key},
                JWT_SECRET
            );
            res.status(httpStatus.CREATED).json({
                code: "1000",
                message: "OK",
                data: {
                    id: savedUser._id,
                    phonenumber: savedUser.phonenumber,
                    username: savedUser.username,
                    avatar: savedUser.avatar,
                    publicKey: publicKey
                },
                token: token
            })
        } catch (e) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: e.message
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.login = async (req, res, next) => {
    try {
        const {
            phonenumber,
            password
        } = req.body;

        if (!phonenumber || !password) return callRes(res, responseError.PARAMETER_IS_NOT_ENOUGH);

        const user = await UserModel.findOne({
            phonenumber: phonenumber
        })
        if (!user) {
            // return res.status(httpStatus.BAD_REQUEST).json({
            //     code: '508',
            //     message: 'Password or phone is incorrect'
            // })
            return callRes(res, responseError.PASSWORD_OR_PHONE_IS_INCORRECT);
        }

        // password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            // return res.status(httpStatus.BAD_REQUEST).json({
            //     code: '508',
            //     message: 'Password or phone is incorrect'
            // })
            return callRes(res, responseError.PASSWORD_OR_PHONE_IS_INCORRECT);
        }

        // login success

        // create and assign a token
        const token = jwt.sign(
            {username: user.username, firstName: user.firstName, lastName: user.lastName, id: user._id},
            JWT_SECRET
        );
        delete user["password"];
        return res.status(httpStatus.OK).json({
            data: user,
            token: token
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.edit = async (req, res, next) => {
    try {
        let userId = req.userId;
        let user;
        const dataUserUpdate = {};
        const listPros = [
            "username",
            "gender",
            "birthday",
            "description",
            "address",
            "city",
            "country",
            "avatar",
            "cover_image",
            "email",
            "fcm",
            "online"
        ];
        for (let i = 0; i < listPros.length; i++) {
            let pro = listPros[i];
            if (req.body.hasOwnProperty(pro)) {
                dataUserUpdate[pro] = req.body[pro];
            }
        }


        user = await UserModel.findOneAndUpdate({_id: userId}, dataUserUpdate, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }
        user = await UserModel.findById(userId).select('phonenumber username gender birthday email city country address description avatar cover_image blocked_inbox blocked_diary');
        return res.status(httpStatus.OK).json({
            data: user
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.changePassword = async (req, res, next) => {
    try {
        let userId = req.userId;
        let  user = await UserModel.findById(userId);
        if (user == null) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "UNAUTHORIZED"
            });
        }
        const {
            currentPassword,
            newPassword,
        } = req.body;
        // password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Current password incorrect',
                code: 'CURRENT_PASSWORD_INCORRECT'
            });
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user = await UserModel.findOneAndUpdate({_id: userId}, {
            password: hashedNewPassword
        }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }

        // create and assign a token
        const token = jwt.sign(
            {username: user.username, firstName: user.firstName, lastName: user.lastName, id: user._id},
            JWT_SECRET
        );
        user = await UserModel.findById(userId).select('phonenumber username gender birthday email city country address description avatar cover_image blocked_inbox blocked_diary');
        return res.status(httpStatus.OK).json({
            data: user,
            token: token
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message,
        });
    }
}
usersController.show = async (req, res, next) => {
    try {
        let userId = null;
        if (req.params.id) {
            userId = req.params.id;
        } else {
            userId = req.userId;
        }

        let user = await UserModel.findById(userId).select('phonenumber username gender birthday email city country address description avatar cover_image blocked_inbox blocked_diary');
        if (user == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }

        return res.status(httpStatus.OK).json({
            data: user
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}
usersController.setBlock = async (req, res, next) => {
    try {
        let targetId = req.body.user_id;
        let type = req.body.type;
        let user = await UserModel.findById(req.userId);
        blocked = []
        if (user.toObject().hasOwnProperty('blocked_inbox')) {
            blocked = user.blocked_inbox
        }

        if(type) {
     
            if(blocked.indexOf(targetId) === -1) {
                blocked.push(targetId);
            }
        } else {
            const index = blocked.indexOf(targetId);
            if (index > -1) {
                blocked.splice(index, 1);
            }
        }

        user.blocked_inbox = blocked;
        user.save();
        
        res.status(200).json({
            code: 200,
            message: "Thao tác thành công",
            data: user
        });
        
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.setBlockDiary = async (req, res, next) => {
    try {
        let targetId = req.body.user_id;
        let type = req.body.type;
        let user = await UserModel.findById(req.userId);
        blocked = []
        if (user.toObject().hasOwnProperty('blocked_diary')) {
            blocked = user.blocked_diary
        }
    
        if(type) {
     
            if(blocked.indexOf(targetId) === -1) {
                blocked.push(targetId);
            }
        } else {
            const index = blocked.indexOf(targetId);
            if (index > -1) {
                blocked.splice(index, 1);
            }
        }

        user.blocked_diary = blocked;
        user.save();

        res.status(200).json({
            code: 200,
            message: "Thao tác thành công",
            data: user
        });

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.searchUser = async (req, res, next) => {
    try {
        let userId = req.userId;
        // console.log(userId)
        let searchKey = new RegExp(req.body.keyword, 'i');
        // console.log(searchKey)
        let result = await UserModel.find({
            phonenumber: searchKey,
            _id: { $ne: userId }
          }).limit(10).exec();
        // let result = await UserModel.find({phonenumber: searchKey}).limit(10).exec();


        if(result.length > 0){
            res.status(200).json({
                code: 200,
                message: "Tìm kiếm thành công",
                data: result
            });
        }else{
            res.status(httpStatus.NOT_FOUND).json({
                code: 404,
                message: "Không tồn tại"
            });
        }
        

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

module.exports = usersController;