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
const routes = require('./routes')(io);
if(process.env.SHUTDOWN||process.argv.includes('sd')){
    app.use(express.static(path.join(__dirname, 'sd')));
}else{
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
        console.log('chat message sent! Obj was', msgObj)
        msgObj.time = Date.now();
        io.emit('msgOut', msgObj)
    })
});
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