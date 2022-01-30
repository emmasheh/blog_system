// 引入express框架
const express = require("express");

// 引入mongoose模块
const mongoose = require("mongoose");

// 实例化一个express对象
let app = express();

// 引用用户模型对象
const userModel = require("./models/user");

// 引入cookies模块
const Cookies = require("cookies");
// 引入路径模块
const path = require("path");

//!!用户注册：用Express中间模块body-parser来获取解析前端通过POST提交的数据
// 引入body-parser模块
const bodyParser = require("body-parser");

// body-parser配置
app.use(bodyParser.urlencoded({extended: true}))

//!! cookies配置
app.use((req, res, next) => {
    // 向请求体对象中新加一个cookies属性，对应当前请求，相应
    req.cookies = new Cookies(req, res);
    // 给req对象增加一个用户信息的属性，以便所有路由都能读取
    req.userInfo = {};
    // 如果客户端中有cookie信息
    if (req.cookies.get("userInfo")) {
        // 将其解析后存入req.userInfo中
        req.userInfo = JSON.parse(req.cookies.get("userInfo"));
        // 根据用户id从数据库中查询出当前登录用户的信息
        userModel.findById(req.userInfo.userid).then((user) => {
            // 以此判断当前用户是否为管理员
            req.userInfo.isadmin = user.isadmin;
            next();
        });

    } else {
        // 继续下一个中间件
        next();
    }
});


// 所有通过"/api"的url，都由./routes/api.js文件进行处理
app.use("/api", require("./routes/api.js"));

/*
配置模板引擎
*/
// 设置模板引擎的存放目录为当前被执行的js文件的相对目录views
app.set("views", path.join(__dirname, "views"));
// 设置模板引擎为ejs
app.set("view engine", "ejs");


// 使用中间件设置静态资源库的目录,这样我们就可以在 /public 目录下存放相关的静态资源了
app.use("/public", express.static(path.join(__dirname, "/public")));


/*
路由处理
*/
// 所有通过"/"的url，都由./routes/main.js文件进行处理
app.use("/", require("./routes/main.js"));
// 所有"/admin"的url，都由./routes/admin.js文件进行处理
app.use("/admin", require("./routes/admin.js"));

// 连接数据库
mongoose.connect("mongodb+srv://emma:123@blogsystem.bcfa4.mongodb.net/blog1?retryWrites=true&w=majority", (err) => {
    if (!err) {
        // 如果没出错，监听端口号
        app.listen(8080);
        console.log("数据库连接成功！");
        console.log("Page rendered at 8080");
    } else {
        // 出错则抛出异常
        throw err;
    }
});



