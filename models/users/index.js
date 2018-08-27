var mongoose = require('mongoose'),
    crypto = require('crypto'),
    passportLocalMongoose = require('passport-local-mongoose');

var usrSchema = new mongoose.Schema({
    user: String, //(user)name of the user,
    pass: String,
    salt: String,
    avatar:String,//base64 avatar
    desc: String, //optional user description
    isBanned:{ type: Boolean, default: false },
    mod: { type: Boolean, default: false }, //only mods can sticky/unsticky and lock/unlock threds
    confirmed:{type:Boolean,default:false},
    lastLogin:Date,
    chars: [{
        name: String,
        prof: String,
        race: String,
        lvl: {type:Number,default:80},
        other:String
    }],
    msgs: [{
        //private messages
        from: String,
        date: Number,
        msg: String
    }]
}, { collection: 'User' });

usrSchema.plugin(passportLocalMongoose, {
    usernameField: 'user',
    hashField: 'pass',
    lastLoginField: 'lastLogin'
});
mongoose.model('User', usrSchema);