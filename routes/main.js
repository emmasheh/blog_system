//！！前台路由文件：博客的内容前台展示：将博客的文章内容从数据库中查询出来，再将数据绑定给模板引擎，由模板引擎渲染出来。
//由于博客首页的数据是需要分页展示的所以就需要调用之前自己定义的的博客分页处理模块 /my_modules/pagination.js ，
//但在此之前得先将博客的文章分类信息从数据库中查询出来，在查询博客分类信息的回调函数中来调用 pagination.js 渲染内容。
// 引入相关模块
const express = require("express");
const categoryModel = require("../models/category");
const contentModel = require("../models/content");
// 引入自定义的分页渲染模块
const pagination = require("../my_modules/pagination");

// 实例化Router对象
const router = express.Router();

// 首页路由配置
router.get("/", (req, res) => {
    // 定义一个变量用来存放传递给模板的其他信息
    let other = {};
    // 分类查询条件
    let where = {};
    // 接收前端传递过来的需要查询分类的id
    if (req.query.categoryId) {
        other.categoryId = req.query.categoryId;
        where.category = req.query.categoryId;
    }

    // 从数据库中查询分类信息
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            // 如果不出错
            other.categories = categories;
            // 调用分页渲染模块渲染内容
            pagination({
                // 每页显示的条数
                limit: 10,
                // 需要操作的数据库模型
                model: contentModel,
                // 需要控制分页的url
                url: "/",
                // 渲染的模板页面
                ejs: "main/index",
                // 查询的条件
                where: where,
                // 给模板绑定参数的名称
                res: res,
                req: req,
                populate: ["category", "author"],
                // 其他数据
                other: other
            });
        } else {
            throw err;
        }
    });
});

// 将其暴露给外部使用
module.exports = router;