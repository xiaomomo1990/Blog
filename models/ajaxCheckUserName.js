var mongodb = require('./db');

function CheckUserName(name) {
    this.name = name;
}

module.exports = CheckUserName;

//验证用户名是否被注册过
CheckUserName.check = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        //读取 posts 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //根据 query 对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败！返回 err
                }
                if (docs.length > 0) {
                    callback(true); //该用户名已被注册
                }
                else {
                    callback(false); //该用户名未被注册
                }
            });
        });
    });
};