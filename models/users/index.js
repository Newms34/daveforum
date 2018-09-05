var mongoose = require('mongoose'),
    crypto = require('crypto'),
    passportLocalMongoose = require('passport-local-mongoose');

var usrSchema = new mongoose.Schema({
    user: String, //(user)name of the user,
    pass: String,
    email:String,
    salt: String,
    otherInfo:String,
    avatar: String, //base64 avatar
    isBanned: { type: Boolean, default: false },
    mod: { type: Boolean, default: false }, //only mods can sticky/unsticky and lock/unlock threds
    confirmed: { type: Boolean, default: false },
    lastLogin: Number,
    chars: [{
        name: String,
        prof: String,
        race: String,
        lvl: { type: Number, default: 80 },
        other: String
    }],
    msgs: [{
        //private messages
        from: String,
        date: Number,
        msg: String,
        isRep: { type: Boolean, default: false },
        read:{type:Boolean,default:false}
    }],
    tz:{type:Number,default:-5},
    ints: [{ type: Number, default: 0 }]
}, { collection: 'User' });

usrSchema.plugin(passportLocalMongoose, {
    usernameField: 'user',
    hashField: 'pass',
    lastLoginField: 'lastLogin'
});
mongoose.model('User', usrSchema);