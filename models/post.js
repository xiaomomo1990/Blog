var mongodb = require('./db'),
    markdown = require("markdown").markdown,
    ObjectID = require('mongodb').ObjectID;

function Post(name, title, post, classes, summary, authodId) {
    this.name = name;
    this.title = title;
    this.post = post;
    this.class = classes;
    this.summary = summary;
    this.authodId = authodId;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        class: this.class,
        summary: this.summary,
        authodId: this.authodId
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }
                callback(null); //返回 err 为 null
            });
        });
    });
};

//读取文章及其相关信息
Post.get = function (name, callback, classes, id, authodId) {

    var mark = 0;
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }

            if (id) {
                //console.log(id);
                query._id = new ObjectID(id);

            }
            if (classes != "index" && classes) {
                query.class = classes;
            }

            if (authodId) {
                query.authodId = authodId;

            }

            //根据 query 对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }


                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs); //成功！以数组形式返回查询的结果
            });
        });
    });
};

//读取文章的可编辑状态
Post.editGet = function (callback, id) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (id) {
                //console.log(id);
                query._id = new ObjectID(id);

            }

            //根据 query 对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }
                callback(null, docs); //成功！以数组形式返回查询的结果
            });
        });
    });
};

//更新一篇文章及其相关信息
Post.prototype.update = function (title, post, classes, summary, _id, callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        time: time,
        title: title,
        post: post,
        class: classes,
        summary: summary
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合

            collection.update({
                _id: new ObjectID(_id)
            }, { $set: post }, function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回err
                }
                callback(null); //返回 err 为 null
            });
        });
    });
};

//验证用户名是否被注册过
Post.remove = function (authodId, _id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        console.log(authodId);

        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {
                authodId: authodId,
                _id: new ObjectID(_id)
            };
            //根据 query 对象查询文章并删除
            collection.remove(query, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }
                callback(null); //删除成功
            });
        });
    });
};