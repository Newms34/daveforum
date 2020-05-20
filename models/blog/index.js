const mongoose = require('mongoose'),
uuid = require('uuid');
//Each item in vote will last for a certain period of time. After this time is elapsed, it'll either be accepted or rejected.
const blogSchema = new mongoose.Schema({
    title:String,
    txtHtml:String,//html content
    txtMd:String,//markdown content
    time:{type:Number,default:Date.now()},//date of last edit
    timeCreated:{type:Number,default:Date.now()},//date of creation. NOT editable!
    media:{url:String,mediaType:String},
    pid:{type:String,default:uuid.v4()}
}, { collection: 'blog' });
mongoose.model('blog', blogSchema);
