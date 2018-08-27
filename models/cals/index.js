var mongoose = require('mongoose'),
    uuid = require('uuid/v4');
//Each item in vote will last for a certain period of time. After this time is elapsed, it'll either be accepted or rejected.
var calSchema = new mongoose.Schema({
    id:{type:String,default:uuid()},
    title:String,
    text:String,//description of event
    user:String,//user that set this event
    eventDate:{type:Number,default:-1},
    createDate:{type:Number,default:Date.now()},
    lastUpd:{type:Number,default:Date.now()}
}, { collection: 'cal' });
mongoose.model('cal', calSchema);
