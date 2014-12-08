var mongodb = require('./db');
function Post (post) {
	this.title = post.title;
	this.article = post.article;
	this.name = post.name;
	this.tag = post.tag;
}

module.exports = Post;

Post.prototype.save = function(callback) {
	var date = new Date(),
		year= date.getFullYear(),
		month= year + "-" + (date.getMonth() + 1),
		day=month + "-" +(date.getDate()),
		minute=day + " " + date.getHours() + ":" + (date.getMinutes()<10 ? '0'+date.getMinutes() 
			: date.getMinutes());

	var time = {
		date: date,
		year:year,
		minute: minute,
		day: day,
		minute: minute		
	}
	var post = {
		title: this.title,
		time: time,
		name: this.name,
		article: this.article,
		tag: this.tag,
		comments: []
	}
	mongodb.open(function(err , db){
		if(err){
			return callback(err);
		}
		db.collection('posts' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(post , {
				safe: true
			} , function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				return callback(null);
			});
		});
	});
};
//按作者姓名查找
Post.getTen = function(name , page , callback){
	mongodb.open(function(err , db){
		if(err){
			return callback(err);
		}
		db.collection('posts' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			collection.count(query , function(err , total){
				collection.find(query , {
					skip: (page -1) * 10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function(err , posts){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null , posts , total);
				});
			});
		});
	});
};

Post.getAll = function(name, callback){
	mongodb.open(function(err , db){
		if(err){
			return callback(err);
		}
		db.collection('posts' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}			
			collection.find(query).sort({
				time: -1
			}).toArray(function(err , posts){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null , posts);
			});			
		});
	});
};

Post.getOne = function(name , minute , title , callback){
	mongodb.open(function(err , db){
		if(err){
			mongodb.close();
		}
		db.collection('posts' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"name": name,
				"title":title,
				"time.minute":minute
			},function(err , post){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null , post);
			});
		});
	});
};

