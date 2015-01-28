var mongodb = require('./db'),
    ObjectID = require('mongodb').ObjectID;

function Code(name) {
    this.name = name;
}

module.exports = Code;

//新增一个邀请码
Code.prototype.save = function (callback) {
    //要存入数据库的文档
    var code = {
        name: this.name
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('codes', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(code, {
                safe: true
            }, function (err, thisData) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }
                callback(thisData); //返回 err 为 null
            });
        });
    });
};

//注册新用户时使用邀请码后删除该邀请码记录
Code.remove = function (_id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('codes', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据邀请码值（即邀请码表里面_id值）删除该邀请码记录
            collection.remove({
                "_id": new ObjectID(_id)
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//查询邀请码
Code.get = function (_id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('codes', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据邀请码（即邀请码表里面_id值）查询是否存在该_id值
            collection.find({
                "_id": new ObjectID(_id)
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(null);
                }
                callback(docs);
            });
        });
    });
};