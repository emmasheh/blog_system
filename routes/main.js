//！！前台路由文件
// 引入相关模块
const express = require("express");

// 实例化Router对象
const router = express.Router();

// 首页路由配置
router.get("/", (req, res) => {
    // 渲染首页模板
    res.render("main", {
        // 给模板引擎绑定数据
        userInfo: req.userInfo
    });
});

// 将其暴露给外部使用
module.exports = router;
