//！！用户注册：使用 req.body 来获取前端传过来的post信息
// 引入相关模块
const express = require("express");
// 引入用户数据模型，进行相应的操作
const userModel = require("../models/user");

// 实例化Router对象
const router = express.Router();

// 定义一个返回给前端的消息对象
let responseData;
// 通过中间件对其进行初始化，这样每一次请求都会进行初始化
router.use((req, res, next) => {
    responseData = {
        // 状态码
        code: 0,
        // 返回的消息
        message: ""
    };
    next();
});

/*
    用户注册的接口：
        提交的验证：
            1.用户名不能为空
            2.密码不能为空
            3.两次密码必须一致
        数据库验证：
            1.用户名是否已存在
*/
router.post("/user/register", (req, res, next) => {
    // 用户名
    let username = req.body.username;
    // 密码
    let password = req.body.password;
    // 确认密码
    let repassword = req.body.repassword;

    // 用户名不能为空
    if (username === "") {
        // 设置数据
        responseData.code = 1;
        responseData.message = "用户名不能为空！";
        // 给客户端发送一个json的相应
        res.json(responseData);

        return;
    }
    // 密码不能为空
    if (password === "" || repassword === "") {
        responseData.code = 2;
        responseData.message = "密码或确认密码不能为空！";
        res.json(responseData);
        return;
    }
    // 两次密码必须一致
    if (password !== repassword) {
        responseData.code = 3;
        responseData.message = "两次密码不一致！";
        res.json(responseData);
        return;
    }

    // 向数据库中查询用户名是否已存在
    userModel.findOne({username: username}, (err, user) => {
        // 如果用户名已存在
        if (user) {
            responseData.code = 4;
            responseData.message = "该用户名已存在！";
            res.json(responseData);
            return;
        } else {
            // 用户名不存在，则新建用户
            userModel.create({
                username: username,
                password: password
            }, (err) => {
                if (!err) {
                    responseData.message = "注册成功！";
                    res.json(responseData);
                } else {
                    console.log(err);
                }
            });
        }
    });
});

// 将其暴露给外部
module.exports = router;



//！！用户登录：后端的登录接口, 在其登录成功的时候设置 cookie 信息
/*
    用户登录的接口
        提交的验证：
            1.用户名不能为空
            2.密码不能为空
        数据库的验证：
            1.用户名是否存在
            2.若存在密码是否正确
*/
router.post("/user/login", (req, res, next) => {
    // 用户名
    let username = req.body.username;
    // 密码
    let password = req.body.password;
    console.log(password);
    // 用户名不能为空
    if (username === "") {
        responseData.code = 1;
        responseData.message = "用户名不能为空！";
        res.json(responseData);
        return;
    }
    // 密码不能为空
    if (password === "") {
        responseData.code = 2;
        responseData.message = "密码不能为空！";
        res.json(responseData);
        return;
    }
    // 向数据库查询，用户是否存在
    userModel.findOne({username: username}, (err, user) => {
        // 如果存在该用户
        if (user) {
            // 验证密码是否正确
            if (user.password === password) {
                responseData.message = "登录成功！";
                // 在responseData中新建一个用户信息的属性
                responseData.userInfo = {
                    username: user.username,
                    userid: user._id
                };
                // 设置cookie信息
                req.cookies.set("userInfo", JSON.stringify(responseData.userInfo));
                res.json(responseData);
                return;
            } else {
                responseData.code = 5;
                responseData.message = "密码不正确！";
                res.json(responseData);
                return;
            }
        } else {
            responseData.code = 6;
            responseData.message = "该用户名不存在！";
            res.json(responseData);
            return;
        }
    });
});


//!! 用户登出接口
router.get("/user/logout", (req, res, next) => {
    // 将cookie设为null
    req.cookies.set("userInfo", null);
    res.json(responseData);
});