var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
	    username : {type : String, lowercase : true , required : true,unique : true},
	    password : {type : String, required :true},
	    email : {type : String,lowercase : true,required: true,unique: true},
	    permission : { type : String, required : true , default : 'user'}
  });

module.exports = mongoose.model('User',userSchema);
 
