/*
    2xx Success (Thành công)
200 OK: Request đã được tiếp nhận và xử lý thành công.
201 Created: Request đã được xử lý, kết quả của việc xử lý tạo ra một resource mới. Thông thường trả về URI resourse mới tạo
204 No Content: Server đã xử lý thành công request nhưng không trả về bất cứ content nào.
    4xx: Client Error (Lỗi Client)
400 Bad Request: Server không thể xử lý hoặc sẽ không xử lý các Request lỗi của phía client
401 Unauthorized token
403 Forbidden: Request là hợp lệ nhưng server từ chối đáp ứng nó. Nó có nghĩa là trái phép, người dùng không có quyền cần thiết để tiếp cận với các tài nguyên.
404 Not Found: Các tài nguyên hiện tại không được tìm thấy nhưng có thể có trong tương lai
    5xx: Server Error (Lỗi Server)
500 Internal Server Error: Một thông báo chung chung, được đưa ra khi Server gặp phải một trường hợp bất ngờ, Message cụ thể là không phù hợp.
*/

const responseError = {
    OK: {
        statusCode: 200,
        body:  {
            code: "1000",
            message: "OK"
        }
    },
    CAN_NOT_CONNECT_TO_DB: {
        statusCode: 500,
        body: {
            code: "1001",
            message: "Can not connect to DB"
        }
    },
    PARAMETER_IS_NOT_ENOUGH: {
        statusCode: 400,
        body: {
            code: "1002",
            message: "Parameter is not enough"
        }
    },
    PARAMETER_TYPE_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "1003",
            message: "Parameter type is invalid"
        }
    },
    PARAMETER_VALUE_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "1004",
            message: "Parameter value is invalid"
        }
    },
    UNKNOWN_ERROR: {
        statusCode: 400,
        body: {
            code: "1005",
            message: "Unknown error"
        }
    },
    FILE_SIZE_IS_TOO_BIG: {
        statusCode: 400,
        body: {
            code: "1006",
            message: "File size is too big"
        }
    },
    UPLOAD_FILE_FAILED: {
        statusCode: 500,
        body: {
            code: "1007",
            message: "Upload file failed"
        }
    },
    MAXIMUM_NUMBER_OF_IMAGES: {
        statusCode: 400,
        body: {
            code: "1008",
            message: "Maximum number of images"
        }
    },
    NOT_ACCESS: {
        statusCode: 403,
        body: {
            code: "1009",
            message: "Not access"
        }
    },
    ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER: {
        statusCode: 400,
        body: {
            code: "1010",
            message: "Action has been done previously by this user"
        }
    },
    POST_IS_BANNED: {
        statusCode: 400,
        body: {
            code: "9991",
            message: "Post is banned"
        }
    },
    CHAT_IS_NOT_EXISTED: {
        statusCode: 400, // fix and restore // sử dụng 204 sẽ không trả về bất kì kết quả nào
        body: {
            code: "9992",
            message: "Chat is not existed"
        }
    },
    VIDEO_IS_NOT_EXISTED: {
        statusCode: 400,
        body: {
            code: "9993",
            message: "Video is not existed"
        }
    },
    NO_DATA: {
        statusCode: 400, // fix and restore // sử dụng 204 sẽ không trả về bất kì kết quả nào
        body: {
            code: "9994",
            message: "No data or end of list data"
        }
    },
    USER_IS_NOT_VALIDATED: {
        statusCode: 401, // fix
        body: {
            code: "9995",
            message: "User is not validated"
        }
    },
    USER_EXISTED: {
        statusCode: 400,
        body: {
            code: "9996",
            message: "User already exists"
        }
    },
    PHONE_EXISTED: {
        statusCode: 400,
        body: {
            code: "9997",
            message: "Phone number already exists"
        }
    },
    METHOD_IS_INVALID: {
        statusCode: 400,
        body: {
            code: "9998",
            message: "Method is invalid"
        }
    },
    EXCEPTION_ERROR: {
        statusCode: 400,
        body: {
            code: "9999",
            message: "Exception error"
        }
    },
    NOT_AUTHORIZED_TOKEN_FAILED: {
        statusCode: 401, // fix
        body: {
            code: "401",
            message: "Not authorized, token failed"
        }
    },
    NOT_AUTHORIZED_NO_TOKEN: {
        statusCode: 401, // fix
        body: {
            code: "402",
            message: "Not authorized, no token"
        }
    },
    HAS_BEEN_FRIEND: {
        statusCode: 400,
        body: {
            code: "501",
            message: "Has been friend"
        }
    },
    HAS_BLOCK: {
        statusCode: 400,
        body: {
            code: "502",
            message: "Blocked each other"
        }
    },
    HAS_NOT_BLOCK :{
        statusCode: 400,
        body: {
            code: "502",
            message: "Has not blocked yet"
        }
    },
    DEL_REQUEST_FRIEND_FAILED: {
        statusCode: 400,
        body: {
            code: "503",
            message: "Failed to delete request friend"
        }
    },
    ACCECPT_REQUEST_FRIEND_FAILED: {
        statusCode: 400,
        body: {
            code: "504",
            message: "Failed to accept request friend"
        }
    },
    SET_REQUEST_FRIEND_FAILED: {
        statusCode: 400,
        body: {
            code: "505",
            message: "failed to set request friend"
        }
    },
    HAS_BEEN_LIKED: {
        statusCode: 400,
        body: {
            code: "506",
            message: "Has been liked",
        },
    },
    HAS_NOT_BEEN_LIKED: {
        statusCode: 400,
        body: {
            code: "507",
            message: "Has not been liked",
        },
    },
    PASSWORD_OR_PHONE_IS_INCORRECT: {
        statusCode: 400,
        body: {
            code: "508",
            message: "Password or phone is incorrect",
        },
    }

}

function setAndSendResponse(res, responseError) {
    return res.status(responseError.statusCode).send(responseError.body);
}

function callRes(res, responseErrorName, data=null) {
    if (responseErrorName != responseError.OK) {
        let x = {
            code: responseErrorName.body.code,
            message: responseErrorName.body.message,
            details: null
        }
        if (data) x.details = data.toString();
        return res.status(responseErrorName.statusCode).json(x);
    }
    else {
        let x = {
            code: responseErrorName.body.code,
            message: responseErrorName.body.message,
            data: data
        }
        return res.status(responseErrorName.statusCode).json(x);
    }
}

module.exports = {responseError, setAndSendResponse, callRes};