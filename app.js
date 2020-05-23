const express = require('express'),
    app = express(),
    http = require('http'),
    server = http.Server(app),
    io = require('socket.io')(server),
    path = require('path'),
    _ = require('lodash'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'),
    bodyParser = require('body-parser'),
    Discord = require('discord.js'),
    dsClient = new Discord.Client(),
    fs = require('fs'),
    keys = fs.existsSync('config.json') ? JSON.parse(fs.readFileSync('config.json', 'utf-8')) : {
        apiCodes: {
            guild: process.env.GUILDAPI,
            usr: process.env.USRAPI,
            discordBot: process.env.DISCORDBOT
        }
    },
    session = require('express-session'),
    mangoStore = require('connect-mongodb-session')(session)
passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    compression = require('compression'),
    store = new mangoStore({
        uri: process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? process.env.MONGODB_URI : 'mongodb://localhost:27017/codementormatch',
        collection: 'cmmSeshes'
    });
app.use(compression());
store.on('error', function (error) {
    console.log(error);
});
const sesh = session({
    secret: 'ea augusta est et carissima'
});
const usrModel = require('./models/users')
app.use(sesh);
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(usrModel.authenticate()))
// passport.serializeUser(usrModel.serializeUser());
// passport.deserializeUser(usrModel.deserializeUser());
app.use(cookieParser('spero eam beatam esse'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io)
// app.set('pp', passport)
const routes = require('./routes')(io, keys, dsClient);
if (process.env.SHUTDOWN || process.argv.includes('sd')) {
    app.use(express.static(path.join(__dirname, 'sd')));
} else {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views')));
}
app.use('/', routes);
let names = [];

let isFirstCon = true;
io.on('connection', function (socket) {
    if (isFirstCon) {
        isFirstCon = false;
        // if this is the first new connection, log out everyone else (since this is likely a server restart/update)
        socket.emit('doLogout')
    }

    // //new login stuff
    socket.on('hiIm', function (n) {
        //on a new person connecting, add them to our list and then push out the list of all names.
        names.push({ name: n.name, t: Date.now() });
        console.log('NEW USER', n, 'ALL USERS', names)
        // socket.emit('allNames',names);
    })

    socket.on('getOnline', function () {
        socket.emit('allNames', names);
    })

    //heartbeat
    //every N ms, request response from front-end (client). basically a "Hey! You still alive?"
    setInterval(function () {
        socket.emit('reqHeartBeat', {});
        socket.emit('allNames', names)
    }, 500);
    socket.on('hbResp', function (hbr) {
        //got response from one client
        // for (let i = 0; i < names.length; i++) {
        //     if (names[i].name == n.name) {
        //         names[i].t = Date.now();
        //     }
        // }
        names = _.uniqBy(names, 'name').map(q => {
            if (q.name == hbr.name) {
                q.t = Date.now();
            }
            return q;
        })
        let now = Date.now();
        names = names.filter(nm => now - nm.t < 1000)
        // console.log('ONLINE',names.map(q=>q.name))
    })

    //messaging (for chat!)
    socket.on('chatMsg', function (msgObj) {
        // console.log('chat message sent! Obj was', msgObj)
        msgObj.time = Date.now();
        // 713528260100620329
        // dsClient.channels.cache.get('713528260100620329').send(`${msgObj.user} says: ${msgObj.msg}`)
        io.emit('msgOut', msgObj)
    })
    /* dsClient.on('message',m=>{
        //could filter for appropriate channel via m.channel.id== (above id)
        console.log('Got message from discord',m.content,m.channel)
    }) */
});

dsClient.genBrethrenMsg = function (data, user) {
    // console.log('attempting to generate message from',data,user)
    const dmsg = new Discord.MessageEmbed()
        .setColor('#aa3300')
        .setTitle(data.title)
        .setURL('https://brethrenpain.herokuapp.com/')
        // .addFields({ name: '\u200B', value: '\u200B' },{ name: '\u200B', value: '\u200B' },{ name: '\u200B', value: '\u200B' })
        .setAuthor(user.user)
        .setDescription(data.txtMd)
        .setTimestamp();
    if (data.media && data.media.mediaType && data.media.mediaType == 'youtube') {
        const p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        data.media.url.match(p);//note we're essentially discarding this, but it still temporarily "saves" the match!
        let youtubeId = RegExp.$1;
        //https://img.youtube.com/vi/t3217H8JppI/1.jpg
        console.log('Setting youtube vids!',youtubeId,`https://img.youtube.com/vi/${youtubeId}/0.jpg`)
        dmsg.setThumbnail(`https://img.youtube.com/vi/${youtubeId}/1.jpg`)
        dmsg.setImage(`https://img.youtube.com/vi/${youtubeId}/0.jpg`)
    }else if(data.media && data.media.mediaType && data.media.mediaType == 'img'){
        dmsg.setThumbnail(data.media.url)
        dmsg.setImage(data.media.url)
    }
    return dmsg;
}

dsClient.once('ready', function () {
    console.log('Discord server started. Starting main server!')
    server.listen(process.env.PORT || 8080);
    server.on('error', function (err) {
        console.log('Oh no! Err:', err)
    });
    server.on('listening', function (lst) {
        console.log('Server is listening!')
    });
    server.on('request', function (req) {
        // console.log(req.url);
    })
})
dsClient.login(keys.apiCodes.discordBot);
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log('Client (probly) err:', err)
    res.send('Error!' + err)
});