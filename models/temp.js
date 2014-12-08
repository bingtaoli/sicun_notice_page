var mongodb = require('./db');

function Temp (temp) {
	this.name = temp.name;
	this.password = temp.password;
	this.email  = temp.email;
};

module.exports = Temp;

Temp.prototype.save = function(callback) {
	var temp = {
		name: this.name,
		password : this.password,
		email : this.email
	};
	mongodb.open(function(err , db){
		if(err){
			return callback(err);
		}
		db.collection('temps' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(temp , {
				safe: true
			},function(err , temp){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null , temp[0]);
			});
		});
	});
};


Temp.get = function(name , callback){
	mongodb.open(function(err , db){
		if(err){
			return callback(err);
		}
		db.collection('temps' , function(err , collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name: name
			},function(err , temp){
				mongodb.close();
				if(err){
					return callback(err);
				}
				return callback(null , temp);
			});
		});
	});
};

