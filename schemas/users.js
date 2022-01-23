//!!涉及用户的数据结构
// 引入mongoose模块，驱动mongodb数据库
const mongoose = require("mongoose");

/*
用户的数据结构
{
    用户名，字符串类型
    用户密码，字符串类型
    是否为管理员，布尔类型，默认为false
}
*/
module.exports = new mongoose.Schema({
    username: String,
    password: String,
    isadmin: {
        type: Boolean,
        default: false
    }
});
