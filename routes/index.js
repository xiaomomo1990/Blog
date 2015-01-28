var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Check = require('../models/ajaxCheckUserName.js'),
    Code = require('../models/code.js');

module.exports = function (app) {
    //主页
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                classes: "index"
            });
        }, null);
    });
    //文章分类列表
    app.get('/acticle/:class', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                classes: req.params.class.toString()
            });
        }, req.params.class);
    });

    //分类文章内容
    app.get('/acticle/:class/:_id', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('acticle', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                classes: req.params.class.toString()
            });
            //console.log(posts.post);
        }, req.params.class, req.params._id);
    });

    //文章分类列表
    app.get('/acticle', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                classes: "index"
            });
        }, null, null, req.query.authodId);
    });

    //注册页面
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            classes: "reg",
            errorName: req.flash("errorName").toString(),
            errorPwd: req.flash("errorPwd").toString(),
            errorPwd_re: req.flash("errorPwd_re").toString(),
            errorEmail: req.flash("errorEmail").toString(),
            codeFlag: req.flash("codeFlag").toString(),
            errorCode: req.flash("errorCode").toString(),
            codeId: req.session.code
        });
    });

    //注册请求页面
    app.post('/reg', function (req, res) {
        var name = req.body.name,
  		password = req.body.password,
  		password_re = req.body["password-repeat"],
        email = req.body.email,
        code = req.body.code;

        if (req.body.code) {
            //待写            
            Code.get(code, function (info) {
                if (!info) {
                    req.flash("errorCode", "邀请码出错!");
                }
                else if (info.length > 0) {
                    req.flash("codeFlag", "邀请码正确!");
                    req.session.code = req.body.code;
                }
                else {
                    req.flash("errorCode", "邀请码不存在或已被使用!");
                }
                return res.redirect("/reg"); //返回注册页
            });

        }
        else {
            if (name.length == 0 || password.length == 0 || password_re.length == 0 || email.length == 0) {
                req.flash("error", "有内容未填写!");

                if (name.length == 0) {
                    req.flash("errorName", "名字未填写");
                }
                if (password.length == 0) {
                    req.flash("errorPwd", "密码未填写!");
                }
                if (password_re.length == 0) {
                    req.flash("errorPwd_re", "重复密码未填写!");
                }
                if (email.length == 0) {
                    req.flash("errorEmail", "邮箱未填写!");
                }

                return res.redirect("/reg"); //返回注册页
            }



            if (password_re != password) {
                req.flash("error", "两次输入的密码不一致!");
                return res.redirect("/reg"); //返回注册页
            }

            var md5 = crypto.createHash("md5"),
  		        password = md5.update(req.body.password).digest("hex");
            var newUser = new User({
                name: name,
                password: password,
                email: req.body.email
            });

            User.get(newUser.name, function (err, user) {
                if (err) {
                    req.flash("error", err);
                    return res.redirect("/acticle/index");
                }
                if (user) {
                    req.flash("error", err);
                    return res.redirect("/acticle/index");
                }

                //如果不存在则新增用户
                newUser.save(function (err, user) {
                    if (err) {
                        req.flash("error", err);
                        return res.redirect("/acticle/index");
                    }
                    Code.remove(req.session.code, function (info) {
                        if (info) {
                            req.flash("errorCode", "数据处理出错!");
                            return res.redirect("/reg"); //返回注册页
                        }
                        else {
                            req.session.code = null; //清空本机邀请码信息
                            req.session.user = user; //用户信息存入session
                            req.flash("success", "注册成功");
                            return res.redirect("/acticle/index"); //返回注册页
                        }
                    });

                });
            });

        }
    });

    //登录页面
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            classes: "login"
        });
    });

    //登录请求页面
    app.post('/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login'); //用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login'); //密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/'); //登陆成功后跳转到主页
        });
    });


    //文章发表页
    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            classes: "post"
        });
    });
    //文章发表请求
    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post, req.body.class, req.body.summary, currentUser._id);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/acticle/index');
            }
            req.flash('success', '发布成功!');
            res.redirect('/acticle/index'); //发表成功跳转到主页
        });
    });
    //退出页
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/acticle/index'); //登出成功后跳转到主页
    });

    //验证用户名是否被注册过
    app.get("/checkUserName", function (req, res, next) {
        var data = true;

        Check.check(req.query.name, function (flag) {
            res.send({ status: flag });
        });
    });

    //邀请码页面
    app.get("/code", function (req, res) {
        res.render("code", {
            title: "邀请码",
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            code: req.flash('code').toString(),
            name: req.flash('name').toString(),
            classes: "reg"
        });
    });

    //邀请码获取
    app.post("/code", function (req, res) {
        var name = req.body.code,
            code = new Code(name);
        code.save(function (thisData) {
            req.flash('code', thisData[0]._id);
            req.flash('name', thisData[0].name);
            res.redirect('/code'); //成功获取邀请码
        });
    });

    //编辑文章
    app.get("/edit/:class/:_id", function (req, res) {
        var currentUser = req.session.user;

        Post.editGet(function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('edit', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                editError: req.flash('editError').toString(),
                classes: req.params.class.toString()
            });
            //console.log(posts.post);
        }, req.params._id);

    });

    //更新文章
    app.post("/edit/:class/:_id", function (req, res) {
        var currentUser = req.session.user,
            post = new Post(),
            bufferhelper = new Bufferhelper();
        var urlEdit = "/edit/" + encodeURIComponent(req.params.class) + "/" + req.params._id,
            urlActicle = "/acticle/" + encodeURIComponent(req.params.class) + "/" + req.params._id;

        post.update(req.body.title, req.body.post, req.body.class, req.body.summary, req.params._id, function (err) {
            if (err) {
                req.flash("editError", "更新出错!");
                return res.redirect(urlEdit);
            }
            res.redirect(urlActicle);

        });

    });

    //删除文章
    app.get("/delete/:_id", function (req, res, next) {

        if (!req.session.user) {
            req.flash("error", "对不起，您没有删除该文章的权限.");
            return res.redirect("/acticle/index");
        }

        Post.remove(req.session.user._id, req.params._id, function (err) {
            if (err) {
                req.flash("error", "数据操作有误.");
                return res.redirect("/acticle/index");
            }
            res.send({ status: "删除文章操作成功！" });
        });
    });


    /*
    * function
    */
    //检查是否已登录
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/login');
        }
        next(); //转移控制权
    }

    //检查是否未登录
    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            res.redirect('back');
        }
        next(); //转移控制权
    }
};