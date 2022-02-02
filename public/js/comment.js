//！！评论相关的ajax
$(() => {
    // 提交评论
    (() => {
        // 获取提交按钮
        $subBtn = $("#comment-btn");
        // 获取评论内容
        $comment = $("#comment");
        // ajax请求
        $subBtn.on("click", () => {
            // 简单验证
            if ($comment.val() === "") {
                alert("评论内容不能为空");
                return;
            }
            $.ajax({
                type: "post",
                url: "/api/comment/post",
                data: {
                    contentId: $("#contentId").val(),
                    comment: $comment.val()
                },
                dataType: "json",
                success: (result) => {
                    // 调用渲染评论函数
                    renderComment();
                    $comment.val("")
                }
            });
        });
    })();

    // 渲染评论的函数:一旦评论成功，下面评论显示
    renderComment = () => {
        // ajax请求
        $.ajax({
            type: "get",
            url: "/api/comment/",
            data: {
                contentId: $("#contentId").val(),
            },
            dataType: "json",
            success: (result) => {
                // 创建html结构
                let commentList = "";
                for (let i = result.length - 1; i >= 0; i--) {
                    // 格式化时间
                    let postTime =
                    commentList += `
                        <div>
                            <span>用户：${ result[i].username } | 时间：${ result[i].postTime }</span>
                            <p>${ result[i].content }</p>
                        </div>
                    `
                }
                // 添加进入html文档中
                $(".commentList").html(commentList);
            }
        });
    }

    // 调用渲染评论函数
    renderComment();

});