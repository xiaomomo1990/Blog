var mongodb = require("./db");

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback){
	var user = {
		name : this.name,
		password : this.password,
		email : this.email
	}

	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取users集合
		db.collection("users",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//将用户数据插入users集合
			collection.insert(user,{
				safe:true
			},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);
			});
		});

	});

};

User.get = function(name,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection("users",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找用户名（name键）值为name的一个文档
			collection.findOne({
				name:name
			},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);//失败！返回err信息
				}
				callback(null,user);//成功！返回查询的用户信息

			});

		});
	});
};