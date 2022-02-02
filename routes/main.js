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

//！！Marked模块是一个Markdown解析，编译器（作者输入的是markdown形式，但是html要在博客中渲染出来要用marked解析器来翻译markdown里面的东西）

const {marked} = require("marked");
// 配置marked
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

// 定义一个变量用来存放传递给模板的其他信息
let other = {};
// 分类查询条件
let where = {};

// 处理通用数据
router.use("/", (req, res, next) => {
    // 接收前端传递过来的需要查询分类的id
    if (req.query.categoryId) {
        // 如果前端传有数据过来
        other.categoryId = req.query.categoryId;
        where.category = req.query.categoryId;
    } else {
        // 没有则置空，以方便模板引擎判断渲染不同的面板
        where = {};
        other.categoryId = null;
    }
    // 从数据库中查询出分类信息
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            // 如果不出错
            other.categories = categories;
        } else {
            throw err;
        }
    });
    // 继续向下一个中间件走
    next();
});

// 首页路由配置
router.get("/", (req, res) => {
        let obj = {
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
        }
        // 调用分页渲染模块渲染内容
        pagination(obj);
});

// 内容页面：加入了marked模块之后
router.get("/views", (req, res) => {
    // 获取文章id
    let contentId = req.query.contentId;
    // 根据id从数据库中查询文章内容
    contentModel.findById(contentId).populate(["category", "author"]).then((content) => {
        // 使用marked渲染内容成html
        let contentHtml = marked(content.content);
        // 渲染内容模板
        res.render("main/views", {
            userInfo: req.userInfo,
            other: other,
            contentHtml: contentHtml,
            content: content
        });
        // 阅读量增加
        content.views ++;
        content.save();
    });
});

// 将其暴露给外部使用
module.exports = router;