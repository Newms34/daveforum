const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    https = require('https'),
    async = require('async'),
    mongoose = require('mongoose');

module.exports = function(io) {
    router.use('/user', require('./subroutes/users')(io));
    router.use('/forum', require('./subroutes/forums')(io));
    router.use('/tool', require('./subroutes/tools')(io));
    router.use('/cal', require('./subroutes/cal')(io));
    router.get('*', function(req, res, next) {
        console.log('trying to get main page!')
        res.sendFile('index.html', { root: './views' })
    });
    router.use(function(req, res) {
        res.status(404).end();
    });
    return router;
};

//helper stuff
Array.prototype.findOne = function(p, v) {
    let i = 0;
    if (typeof p !== 'string' || !this.length) {
        return false;
    }
    for (i; i < this.length; i++) {
        if (this[i][p] && this[i][p] == v) {
            return i;
        }
    }
    return false;
}

Array.prototype.removeOne = function(n) {
    this.splice(this.indexOf(n), 1);
}

const cronny = setInterval(function() {
    console.log('Checking upcoming events at', new Date().toLocaleString())
    let now = Date.now();
    mongoose.model('cal').find({ kind: 'lotto' }, function(err, lottos) {
        lottosExp = lottos.filter(lt => lt.eventDate < now && !lt.expired)
        console.log(now, 'all lottos', lottos.map(e => e.eventDate), 'expiring/expired', lottosExp.map(e => e.eventDate));
        if (lottosExp.length) {
            lottosExp.forEach(lto => {
                mongoose.model('User').find({ isBanned: false, confirmed: true }, function(err, usrs) {
                    console.log('Users available to win this contest are:', usrs);
                    //'win' one
                    const theWinner = usrs[Math.floor(Math.random() * usrs.length)];
                    lto.text += '<br>WINNER: ' + theWinner.user;
                    lto.expired = true;
                    lto.save()
                    mongoose.model('User').findOne({ 'user': theWinner.user }, function(err, usr) {
                            usr.msgs.push({
                                from: lto.user,
                                date: Date.now(),
                                msg: `<h3>Congratulations!</h3>
                                You've won the event "${lto.title}"! Contact ${lto.user} for further details and to claim your prize(s)!`
                            })
                            console.log(usr)
                            usr.save(function(err, usr) {
                                console.log('User updated!', usr, err)
                            });
                    });
                })
            })
        } else {
            return false; //nothin to do
        }
    })
}, 10000)

// 1536537600000,
// 1536302076654, 1536303943330 - 1536303685943