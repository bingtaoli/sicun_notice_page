var User = require('../models/user.js'),
	Temp = require('../models/temp.js'),
	Post = require('../models/post.js'),
	Comment = require('../models/comment.js'),
	crypto = require('crypto');

module.exports = function  (app) {
	
	app.get('/' , function(req , res){
		Post.getAll(null , function(err , posts){
			if(err){
				console.log("haha");
				posts = [];
			}
			res.render('index' , {
				title: "主页",
				user : req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
			});
		});
	});
	app.get('/login' , checkNotLogin);
	app.get('/login' , function(req , res){
		res.render('login' , {
			title: "登录",
			user : req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	});
	app.get('/regist' , checkNotLogin);
	app.get('/regist' , function(req , res){
		res.render('regist' , {
			title: "注册",
			user : req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	});
	app.post('/regist' , checkNotLogin);
	app.post('/regist' , function(req , res){
		var name = req.body.name,
			password = req.body.password,
			email = req.body['email'],
			password_re = req.body['password-repeat'];
		
		if(password_re == null || password == null){
			req.flash('error' , '密码不能为空');
			return res.redirect('/reg');
		}
		if(password_re != password){
			req.flash('error' , '两次密码输入不一致');
			return res.redirect('/reg');
		}
		if(email == null){
			req.flash('error' , '邮箱不能为空');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5'),
			password = md5.update(password).digest('hex');
		
		var newUser = new User({
			name : name,
			password: password,
			email : req.body.email
		});
		User.get(name , function(err , user){
			if(user){
				req.flash('error' , '用户名已存在');
				return res.redirect('/regist');
			}
			newUser.save(function(err , user){
				if(err){
					req.flash('error' , err);
					return res.redirect('/regist');
				}
				req.session.user = user;
				req.flash('success' , '注册成功');
				res.redirect('/');
			});			
		});
	});
	/*app.post('/regist' , function(req , res){
		var name = req.body.name,
			password = req.body.password,
			email = req.body['email'],
			password_re = req.body['password-repeat'];
		
		if(password_re == null || password == null){
			req.flash('error' , '密码不能为空');
			return res.redirect('/reg');
		}
		if(password_re != password){
			req.flash('error' , '两次密码输入不一致');
			return res.redirect('/reg');
		}
		if(email == null){
			req.flash('error' , '邮箱不能为空');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5'),
			password = md5.update(password).digest('hex');
		
		var newTemp = new Temp({
			name : name,
			password: password,
			email : req.body.email
		});
		User.get(name , function(err , user){
			if(user){
				req.flash('error' , '用户名已存在，请去登陆界面登陆');
				return res.redirect('/login');
			}
			Temp.get(name , function(err , user){
				if(user){
					req.flash('error' , '用户名已经正在审核中,请等待');
					return res.redirect('/regist');
				}
				newTemp.save(function(err , temp){
					if(err){
						req.flash('error' , err);
						return res.redirect('/regist');
					}
					req.flash('success' , '提交成功，请联系主管审核');
					res.redirect('/');
				});			
			});		
		});		
	});*/
	app.post('/login' , checkNotLogin);
	app.post('/login' , function(req , res){			
		var name = req.body.name;
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
					
		User.get(name , function(err , user){
			

			if(err){
				req.flash('error' , err);
				res.redirect('/login');
			}			
			if(!user){
				req.flash('error' , '用户名不存在');
				return res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error' , '密码不正确');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success' , '登陆成功');
			res.redirect('/');
		});
	});
	app.get('/logout' , checkLogin);
	app.get('/logout' , function(req , res){
		req.session.user = null;
		req.flash('success' , '登出成功');
		res.redirect('/');
	});
	app.get('/post' , checkLogin);
	app.get('/post' , function(req , res){
		res.render('post' , {
			title: "发布",
			user : req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
		})
	});
	app.post('/post' , checkLogin);
	app.post('/post' , function(req , res){
		var post = {
			title: req.body.title,
			article : req.body.article,
			tag : req.body.tag,
			name : req.session.user.name
		};
		var newpost = new Post(post);
		newpost.save(function(err){
			if(err){
				req.flash('error' , err);
				return res.redirect('/');
			}
			req.flash('success' , '发布成功');
			res.redirect('/');
		});
	});
	app.get('/u/:name/:title/:minute' , function(req , res){
		Post.getOne(req.params.name , req.params.minute , req.params.title , function(err , post){
			if(err){
				req.flash('error' , err);
				return res.redirect('/');
			}
			res.render('article' , {
				title: post.title,
				user : req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				post: post
			});
		});
	});
	app.get('/u/:name' , function(req , res){
		Post.getAll(req.params.name , function(err , posts){
			if(err){
				req.flash('error' , err);
				return res.redirect('/');
			}
			res.render('user' , {
				title: req.params.name,
				user : req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				posts: posts
			});
		});
	});
	app.post('/u/:name/:title/:minute' , function(req , res){
		var date = new Date();
		var minute =date.getFullYear() + "-" + (date.getMonth()+1)+ "-"+ date.getDate() + " " + date.getHours() 
			+ ":" + (date.getMinutes()<10 ? '0'+date.getMinutes() 
			: date.getMinutes());
		var comment = {
			name: req.body.name,
			content : req.body.content, 
			minute : minute,
			website: req.body.website
		}
		var newcomment = new Comment(req.params.name , req.params.minute , req.params.title , comment);
		newcomment.save(function(err){
			if(err){
				req.flash('error' , err);
				return res.redirect('back');
			}
			req.flash('success' , '留言成功');
			res.redirect('back');
		});
	});
	app.get('/tag/:tag' , function(req , res){
		
	})
	function checkLogin(req , res , next){
		if(!req.session.user){
			req.flash('error' , '未登录');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req , res , next){
		if(req.session.user){
			req.flash('error' , '已登录');
			res.redirect('back');
		}
		next();
	}

}