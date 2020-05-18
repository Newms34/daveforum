const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    maxMsgLen = 50,
    fs = require('fs'),
    axios = require('axios'),
    keys = fs.existsSync('config.json') ? JSON.parse(fs.readFileSync('config.json', 'utf-8')) : {
        apiCodes: {
            guild: process.env.GUILDAPI,
            usr: process.env.USRAPI
        }
    }/* ,
    authbit = (req, res, next) => {
        if (req.session && req.session.user && req.session.user._id) {
            if (req.session.user.isBanned) {
                res.status(403).send('banned');
            }
            next();
        } else {
            res.status(401).send('err')
        }
    },
    isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    } */;
// mongoose.Promise //I can't need this... can i?

const datesGood = (d) => {
    if (!d || !d.start || !d.end) {
        return false;
    }
    const dst = new Date(d.start).getTime(),
        det = new Date(d.end).getTime();
    return d.start && d.end && !isNaN(dst) && !isNaN(det) && det > dst;
}

const routeExp = function (io) {
    this.authbit = (req, res, next) => {
        if (req.session && req.session.user && req.session.user._id) {
            if (req.session.user.isBanned) {
                res.status(403).send('banned');
            }
            next();
        } else {
            res.status(401).send('err');
        }
    };
    this.isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    }
    //TODO: need way to only let admins (?) add events. All others should get rejected?
    router.post('/new', this.authbit, (req, res, next) => {
        req.body.user = req.session.user.user;
        mongoose.model('cal').create(req.body, function (err, resp) {
            io.emit('refCal', {})
            console.log('ERR', err)
            res.send(resp);
        })
    });
    router.put('/weeklyAutoLotto',this.authbit,(req, res, next) => {
        axios.get(`https://api.guildwars2.com/v2/guild/${keys.apiCodes.guild}/log?access_token=${keys.apiCodes.usr}`).then(r => {
            //req.body.excl is an optional list of accounts we're gonna exclude from this lotto 
            //req.body.dates has two optional dates: start, and end

            const dates = (datesGood(req.body.dates) && req.body.dates) || {
                start: new Date(new Date().getTime() - 604800000),
                end: new Date()
            },
                lottoDonations = r.data.filter(q => {
                    return q.operation == "deposit" && q.item_id === 0 && !!q.coins && (q.coins % 10000) === 0 && (!req.body.excl || !req.body.excl.includes(q.user)) && new Date(q.time).getTime() < new Date(dates.end).getTime() && new Date(q.time).getTime() > new Date(dates.start).getTime();
                }).sort((a, b) => {
                    new Date(a.time).getTime() - new Date(b.time).getTime();
                }).map(q => ({
                    acct: q.user,
                    coins: q.coins,
                    date: q.time,
                    simpleTime: new Date(q.time).toLocaleString(),
                    type: q.type,
                    op: q.operation,
                    numTickets: q.coins / 10000
                })),
                ticketCounts = {};
            lottoDonations.forEach(td=>{
                if(!ticketCounts[td.acct]){
                    ticketCounts[td.acct]=0;
                }
                ticketCounts[td.acct]+=td.numTickets
            }), lottoFreqArr = [];
            Object.keys(ticketCounts).forEach(tn=>lottoFreqArr.push(...new Array(ticketCounts[tn]).fill(1).map(q=>tn)))

            res.send({
                donations: lottoDonations,
                donNum: lottoDonations.length,
                ticketCounts: ticketCounts,
                randUsr:lottoFreqArr[Math.floor(Math.random()*lottoFreqArr.length)]
            });
        })
    })
    router.post('/lottoPay', this.authbit, (req, res, next) => {
        //route to designate a particular user as having 'paid' for a lottery (that requires pay)
        if (!req.body.pusr || !req.body.lottoId) {
            res.send('err');//no lotto OR no user to pay.
            return false;
        }
        mongoose.model('cal').findOne({ _id: req.body.lottoId }, (err, lt) => {
            console.log('LOTTO FOUND IS', lt)
            if (lt.paid.indexOf(req.body.pusr) < 0) {
                lt.paid.push(req.body.pusr);
            }
            lt.save((err, ltsv) => {
                io.emit('refCal', {})
                res.send(ltsv);
            })
        })
    })
    router.post('/newRep', this.authbit, this.isMod, (req, res, next) => {
        req.body.user = req.session.user.user;
        console.log('User (hopefully a mod) wants to create a repeating event', req.body)
        const oneWeek = 1000 * 3600 * 24 * 7,
            mProms = [], currDate = req.body.eventDate;
        for (let i = 0; i < req.body.repeatNum; i++) {
            mProms.push(mongoose.model('cal').create(req.body));
            req.body.eventDate += oneWeek * req.body.repeatFreq;
            console.log('EVENT now', req.body)
        }
        Promise.all(mProms)
            .then(r => {
                res.send(r);
            })
        // mongoose.model('cal').create(req.body, function(err, resp) {
        //     io.emit('refCal',{})
        //     console.log('ERR',err)
        //     res.send(resp);
        // })
    })
    // title: $scope.editEventObj.title,
    // text: $scope.editEventObj.desc,
    // eventDate: time,
    // kind: $scope.editEventObj.kind.kind,
    // id:$scope.editEventObj.id,
    // user:$scope.editEventObj.user
    router.post('/edit', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, (err, usr) => {
            console.log('USER TO EDIT', usr.user, 'USER WHO MADE THIS', req.body.user)
            if (usr.user != req.body.user && !usr.mod) {
                res.send('wrongUser');
                return false;
            } else {
                mongoose.model('cal').findOneAndUpdate({ _id: req.body.id }, {
                    title: req.body.title,
                    text: req.body.text,
                    eventDate: req.body.eventDate,
                    kind: req.body.kind,
                    lastUpd: Date.now()
                }, function (err, upd) {
                    io.emit('refCal', {})
                    res.send('done')
                })
            }
        })
    })
    router.get('/del', this.authbit, this.isMod, (req, res, next) => {
        console.log('deleting', req.query.id)
        mongoose.model('cal').remove({ _id: req.query.id }, function (err, resp) {
            io.emit('refCal', {})
            res.send(resp);
        })
    })
    router.get('/all', this.authbit, (req, res, next) => {
        const OneWeekAgo = Date.now() - 1000 * 3600 * 24 * 7;
        req.query.time = req.query.time && !isNaN(req.query.time) ? req.query.time : OneWeekAgo;
        mongoose.model('cal').find({ eventDate: { $gt: req.query.time } }, function (err, events) {
            if (err) {
                res.send(err)
            } else {
                res.send(events || null);
            }
        })
    })
    router.get('/latestFive', this.authbit, (req, res, next) => {
        mongoose.model('cal').find({}, (err, events) => {
            res.send(events.sort((a, b) => {
                return b.eventDate - a.eventDatel
            }).slice(0, 5));
        })
    })
    router.get('/clean', this.authbit, this.isMod, (req, res, next) => {
        mongoose.model('cal').remove({}, function (r) {
            res.send('Cleaned!')
        });
    })
    return router;
}
module.exports = routeExp;