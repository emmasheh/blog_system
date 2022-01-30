//!!后台管理路由文件
// 引入相关模块
const express = require("express");
const userModel = require("../models/user");
const categoryModel = require("../models/category")
const pagination = require("../my_modules/pagination")

// 实例化一个Router对象
const router = express.Router();

// 引入内容的模型，用来操作数据库
const contentModel = require("../models/content");

// 进行管理员验证:对用户的身份进行验证，非管理员的用户不允许访问 /admin 相关的路由
router.use((req, res, next) => {
    if (req.userInfo.isadmin) {
        // 如果当前登录用户是管理员
        // 则继续向下一个中间件执行
        next();
    } else {
        // 不是管理员
        res.send("无权限！");
    }
});

// 后台首页路由
router.get("/", (req, res, next) => {
    // 渲染后台模板页面
    res.render("admin/index", {
        // userInfo 是从cookie拿到的 =》什么时候set cookie =》 登陆的时候
        userInfo: req.userInfo
    });
});

router.get("/header", (req, res, next) => {
    // 渲染后台模板页面
    res.render("admin/header", {
        userInfo: req.userInfo
    });
});



// 用户管理首页
router.get("/user", (req, res, next) => {
    // 从数据库中查询所有注册用户
    pagination({
        // 每页显示的条数
        limit: 10,
        // 需要操作的数据库模型
        model: userModel,
        // 需要控制分页的url
        url: "/admin/user",
        // 渲染的模板页面
        ejs: "admin/user/index",
        // 查询的条件
        where: {},
        res: res,
        req: req
    });
});

// 分类首页
router.get("/category", (req, res, next) => {
    // 从数据库中查询所有已添加分类
    pagination({
        // 每页显示的条数
        limit: 10,
        // 需要操作的数据库模型
        model: categoryModel,
        // 需要控制分页的url
        url: "/admin/category",
        // 渲染的模板页面
        ejs: "admin/category/index",
        // 查询的条件
        where: {},
        res: res,
        req: req
    });
});


// 分类添加的首页
router.get("/category/add", (req, res, next) => {
    // 渲染分类添加模板
    res.render("admin/category/add", {
        userInfo: req.userInfo
    });
});

// 文章分类的保存
router.post("/category/add", (req, res, next) => {
    // 获取分类名称，默认为""
    let name = req.body.name || "";

    // 如果名称为空
    if (name === "") {
        // 渲染一个错误提示
        res.render("admin/error", {
            userInfo: req.userInfo,
            url: null,
            message: "分类名称不能为空！"
        });
        return;
    }
    // 从数据库中查询该名称是否已存在
    categoryModel.findOne({name: name}, (err, docs) => {
        // 如果数库库中已存在该名称
        if (docs) {
            // 渲染一个错误提示
            res.render("admin/error", {
                userInfo: req.userInfo,
                url: null,
                message: "该分类名称已存在！"
            });
            return;
        } else {
            // 不存在则新建一个数据
            categoryModel.create({
                name: name
            }, (err) => {
                if (!err) {
                    // 渲染一个错误提示
                    res.render("admin/success", {
                        userInfo: req.userInfo,
                        message: "添加成功！",
                        // 跳转到该路由
                        url: "/admin/category"
                    });
                    return;
                }
            });
        }
    });
});

//!! 分类的修改界面
router.get("/category/edit", (req, res, next) => {
    // 获取用户提交过来的id
    let id = req.query.id || "";
    // 根据id从数据库中查询相关数据
    categoryModel.findOne({_id: id}, (err, category) => {
        if (category) {
            // 如何数据存在则渲染修改界面
            res.render("admin/category/edit", {
                userInfo: req.userInfo,
                category: category
            });
        } else {
            // 若不存在渲染错误提示面板
            res.render("admin/error", {
                userInfo: req.userInfo,
                url: null,
                message: "该分类不存在！"
            });
        }
    });
});

//!! 分类修改的保存:，修改的保存是以 POST 的方式向服务器提交数据（对前端提交过来的数据进行保存）
router.post("/category/edit", (req, res, next) => {
    // 获取修改后的id及名称
    let id = req.query.id;
    let name = req.body.name;

    // 根据id从数据库中查询相关数据
    categoryModel.findById(id, (err, category) => {
        if (category) {
            // 若数据存在
            // 简单验证---如果数据没修改
            if (name === category.name) {
                res.render("admin/success", {
                    url: "/admin/category",
                    userInfo: req.userInfo,
                    message: "修改成功！"
                });
                return;
            }
            // 查询用户修改的分类是否与数据库中的冲突
            categoryModel.findOne({
                _id: {$ne: id},
                name: name
            }, (err, docs) => {
                if (docs) {
                    // 数据冲突
                    res.render("admin/error", {
                        userInfo: req.userInfo,
                        url: null,
                        message: "该分类已存在！"
                    });
                    return;
                } else {
                    // 更新数据
                    categoryModel.update({_id: id}, {$set: {name: name}}, (err) => {
                        if (!err) {
                            // 不出错
                            res.render("admin/success", {
                                userInfo: req.userInfo,
                                url: "/admin/category",
                                message: "修改成功！"
                            });
                            return;
                        } else {
                            // 出错
                            res.render("admin/error", {
                                userInfo: req.userInfo,
                                url: null,
                                message: "修改失败！"
                            });
                            return;
                        }
                    });
                }
            });
        } else {
            // 若不存在
            res.render("admin/error", {
                userInfo: req.userInfo,
                url: null,
                message: "该分类不存在！"
            });
            return;
        }
    });
});

//！！分类的删除
router.get("/category/delete", (req, res, next) => {
    // 获取需要删除的分类id
    let id = req.query.id || "";
    // 从数据库中删除数据
    categoryModel.remove({_id: id}, (err) => {
        if (!err) {
            // 删除成功
            res.render("admin/success", {
                url: "/admin/category",
                userInfo: req.userInfo,
                message: "删除成功！"
            });
        } else {
            // 删除失败
            res.render("admin/error", {
                url: null,
                userInfo: req.userInfo,
                message: "删除失败！"
            });
        }
    });
});


// ！！博客内容管理首页
router.get("/content", (req, res, next) => {
    // 调用自定义的分页渲染方法
    pagination({
        // 每页显示的条数
        limit: 10,
        // 需要操作的数据库模型
        model: contentModel,
        // 需要控制分页的url
        url: "/admin/content",
        // 渲染的模板页面
        ejs: "admin/content/index",
        // 查询的条件
        where: {},
        // 需要跨集合查询的条件
        populate: ["category", "author"],
        res: res,
        req: req
    });
});


// ！！博客内容的添加界面
router.get("/content/add", (req, res, next) => {
    // 从数据中读取分类信息
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            res.render("admin/content/add", {
                userInfo: req.userInfo,
                categories: categories
            });
            return;
        } else {
            throw err;
            return;
        }
    });
});

// ！！内容添加的保存
router.post("/content/add", (req, res, next) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let content = req.body.content;
    // 后端进行简单的验证
    if (title === "") {
        // 如果标题为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "标题不能为空"
        });
        return;
    } else if (description === "") {
        // 如果简介为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "简介不能为空"
        });
        return;
    } else if (content === "") {
        // 如果正文为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "正文不能为空"
        });
        return;
    } else {
        // 一切正常，存入数据库
        contentModel.create({
            title: title,
            category: category,
            author: req.userInfo.userid.toString(),
            description: description,
            content: content
        }, (err) => {
            if (!err) {
                // 保存成功
                res.render("admin/success", {
                    url: "/admin/content",
                    userInfo: req.userInfo,
                    message: "提交成功！"
                });
            } else {
                throw err;
            }
        });
    }
});


// 内容修改的界面
router.get("/content/edit", (req, res, next) => {
    // 获取需要修改内容的id
    let id = req.query.id;
    // 从数据库中查询
    contentModel.findById(id, (err, content) => {
        if (content) {
            // 如果数据存在，从数据库中查询出所有分类
            categoryModel.find({}, (err, categories) => {
                if (!err) {
                    // 渲染修改模板视图
                    res.render("admin/content/edit", {
                        userInfo: req.userInfo,
                        categories: categories,
                        content: content
                    });
                } else {
                    throw err;
                }
            });
        } else {
            // 如果该内容不存在
            res.render("admin/error", {
                url: null,
                userInfo: req.userInfo,
                message: "该内容不存在！"
            });
        }
    });
});

// ！！内容的修改保存：由前端通过 GET 方式向后端传递需要修改的内容的 ID ，后端再从数据库中查询出相应数据进行更新，并将处理结果返回给前端
router.post("/content/edit", (req, res, next) => {
    // 获取数据
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let content = req.body.content;
    let id = req.query.id;

    // 后端进行简单的验证
    if (title === "") {
        // 如果标题为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "标题不能为空!"
        });
        return;
    } else if (description === "") {
        // 如果简介为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "简介不能为空!"
        });
        return;
    } else if (content === "") {
        // 如果正文为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userInfo: req.userInfo,
            message: "正文不能为空!"
        });
        return;
    } else {
        // 一切正常，更新数据库
        contentModel.update({
            _id: id
        }, {
            title: title,
            category: category,
            description: description,
            content: content
        }, (err) => {
            if (!err) {
                // 保存成功
                res.render("admin/success", {
                    url: "/admin/content",
                    userInfo: req.userInfo,
                    message: "修改成功！"
                });
            } else {
                throw err;
            }
        });
    }
});


// ！！内容的删除
router.get("/content/delete", (req, res, next) => {
    // 获取id
    let id = req.query.id;
    // 根据id删除数据
    contentModel.remove({
        _id: id
    }, (err) => {
        if (!err) {
            // 删除成功
            res.render("admin/success", {
                url: "/admin/content",
                userInfo: req.userInfo,
                message: "删除成功！"
            });
        } else {
            // 出错
            res.render("admin/error", {
                url: "/admin/content",
                userInfo: req.userInfo,
                message: "删除失败！"
            });
        }
    });
});


// 将其暴露给外部
module.exports = router;