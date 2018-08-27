var express = require('express');                        // express module included.
var bcrypt = require('bcryptjs');                        // Bycrypts module included.   
var mongoose = require('mongoose');                      // including Mongoose.
var bodyParser = require('body-parser');                 // Body-Parser included. 
var User = require('./app/models/users');                // User Model included.
var path = require('path'); 
var jwt = require('jsonwebtoken'); 

var MongoClient = require('mongodb').MongoClient


    var secret = 'mymeanapp';                            // path module included.   

    var app = express();                                     // Express app Created. 

mongoose.connect('mongodb://localhost:27017/meanapp', function(err){            // Mongoose databse connected
    if(err){
        console.log('Not Connected To Database');
    }else{
        console.log('Connected To Database');
    }
});

app.use(bodyParser.json());                                 //method of bodyParser.
app.use(express.static(__dirname + "/public"));         //express static method to point to the stataic folder. 


app.get('*',function(req, res){
    res.sendFile(path.join( __dirname + '/public/app/views/index.html'));
});

app.post('/register',function(req, res){                      // registeration API defined
    var user = new User();
    
                                
    if(req.body.reg_username == null || req.body.reg_username == '' || req.body.reg_password == null || req.body.reg_password == '' || req.body.reg_email == null || req.body.reg_email == '')
    {
        res.json({ login : false, message : 'Please Fill All The Credentials'});
    }
    else{
        bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.reg_password, salt, function(err, hash) {    
        user.username = req.body.reg_username;
        user.password = hash;
        user.email = req.body.reg_email;
        user.temporarytoken = jwt.sign({ username : user.username, email : user.email }, secret , { expiresIn: '1h' });
        user.save(function(err){
            if(err){
                 res.json({ login : false, message : 'Sorry, username or email-id already exists' });
            }else{

                var token = jwt.sign({ username : user.username, email : user.email }, secret , { expiresIn: '24h' });
                res.json({ login : true, message : 'User Registered', token : token});
            }    
        });
      });
     });
    }    
});


app.post('/login',function(req, res){                // Login API defined
    User.findOne({username : req.body.username},function(err, user){
        if(!user){
             res.json({ login : false, message : 'User cannot be Authenticated!!'});
        }else{ 
           if(!req.body.password){
             res.json({ login : false, message : 'Please Provide Password'});
           }else{ 
        bcrypt.compare(req.body.password, user.password, function(err, data) {
                if(data){

                    var token = jwt.sign({ username : user.username, email : user.email }, secret , { expiresIn: '24h' });

                    res.json({ login : true, message : 'User Authenticated!!', token : token});
                }else{
                    res.json({ login : false, message : 'Password is not Authenticated!!'});
                }
            });
            }
        } 
    });
    
});

app.post('/checkusername',function(req,res){
    var username = req.body.reg_username;
    User.findOne({username : username},function(err, user){
        if(user){
            res.json({ status : false , message : 'Username is already taken'});
        }else{
            res.json({ status : true , message : 'Valid username'});
        }       
    })
});


app.post('/checkemail',function(req,res){

    var email = req.body.reg_email;
    User.findOne({email : email}).select('email').exec(function(err, user){
        if(user){
            res.json({ status : false , message : 'e-mail is already taken'});
        }else{
            res.json({ status : true , message : 'Valid e-mail'});
        }       
    });
});


app.use(function(req, res, next){                               // middleware
    
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if(token){

        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                res.json({ login : 'Error with tokens'});
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        res.json({ login : false , message : 'No token Provided'});
    }
});


app.post('/me',function(req, res){
    res.send(req.decoded);
});


app.post('/newToken/:username', function(req, res){
    User.findOne({username : req.params.username}, function(err, user){
        if(err){
            console.log(err);
        }else if(!user){
            res.json({ status : false , message : 'User does not Exist'});
        }else{
            var newToken = jwt.sign({ username : user.username, email : user.email }, secret , { expiresIn: '24h' });
            res.json({ status : true, token : newToken});
        }
    });
});


app.post('/getpermission',function(req, res){
    User.findOne({ username  : req.decoded.username}, function(err , user){
        if(err){
            console.log(err);
        }else if(!user){
            res.json({ status : false, message : 'User not Found'});
        }else{
            res.json({ status : true , permission : user.permission});
        }
    });
});


app.post('/getallusers',function(req, res){
       User.findOne({ username : req.decoded.username }, function(err, user){
        if(err){
            console.log(err);
        }else if(!user){
            res.json({ status : false , message : 'Sorry , User Not Found'});
        }else{
           if(user.permission == 'admin' || user.permission == 'moderator'){
                User.find({}, function(err, users){
                    if(err){
                        console.log(err);
                    }else if(!users){
                        res.json({ status : false , message : 'No Users Found'});
                    }else{
                        res.json({ status : true , users : users , permission : user.permission});
                    }
                });
           }else{
            res.json({ status : false , message : 'Insufficient Permissions' });
           }  
        }

       });
});

app.delete('/deleteuser/:username', function(req, res){
    
    User.findOne({username : req.decoded.username} , function(err, user){
        if(err){
            console.log(err);
        }else if(!user){
            res.json({ status : false , message : 'Sorry No user found'});
        }else{
            if(user.permission == 'admin'){
                User.remove({ username : req.params.username}, function(err , user){
                    if(err){
                        console.log(err);
                    }else{
                        res.json({ status : true, message : 'User Deleted Successfully!!!'});
                    }
                });
            }else{
                res.json({ status : false , message : 'Sorry, insufficient Permission'});
            }
        }
    });
});


app.post('/getmovies', function(req, res){                                  // To get Song tracks...
     MongoClient.connect('mongodb://localhost:27017/meanapp', function (err, db) {
        db.collection('music').find().toArray(function (err, result) {
            if(err){
                console.log(err);
            }else{
                res.json({ status : true , tracks : result });
            }
        });
    });
});

app.post('/getmoviesongs/:movie_id', function(req, res){

    var id = parseInt(req.params.movie_id);
    MongoClient.connect('mongodb://localhost:27017/meanapp', function (err, db) {
        db.collection('music').find({'movie_id' : id }).toArray(function (err, result) {
            /*console.log(req.params.movie_id);*/
            if(err){
                console.log(err);
            }else{
                res.json({ status : true , tracks : result });
            }
        });
    });
});



app.listen(3000,function(){                                   // Listening to port.     
    console.log('Connection Made');
});