var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    axios = require('axios'),
    sendpie = require('sendmail')({
        logger: {
            debug: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        },
        silent: false
    }),
    isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    };

var routeExp = function(io) {
    this.authbit = (req, res, next) => {
        if (req.session && req.session.user && req.session.user._id) {
            if (req.session.user.isBanned) {
                res.status(403).send('banned');
            }
            next();
        } else {
            res.status(401).send('err')
        }
    };
    router.get('/getUsr', this.authbit, (req, res, next) => {
        res.send(req.session.user);
    });
    router.get('/allUsrs', this.authbit, (req, res, next) => {
        mongoose.model('User').find({}, function(err, usrs) {
            res.send(usrs.map(u => {
                delete u.msgs;
                return u;
            }));
        })
    });
    router.get('/setOneRead', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
        }
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            usr.msgs.filter(m => m._id == req.query.id)[0].read = true;
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.get('/setAllRead', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
        }
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            usr.msgs.forEach(m => m.read = true);
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.get('/daily', this.authbit, (req, res, next) => {
        axios.get('https://api.guildwars2.com/v2/achievements/daily')
            .then((r) => {
                console.log('RESULT', r.data)
                let modes = ['pve', 'pvp', 'wvw', 'fractals', 'special'];
                mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
                    const minUsrLvl = _.minBy(usr.chars, 'lvl').lvl,
                        maxUsrLvl = _.maxBy(usr.chars, 'lvl').lvl;
                    modes.forEach(mode => r.data[mode] = r.data[mode].filter(dl => {
                        console.log('Lookin at daily', dl.id, dl.level.min, dl.level.max, minUsrLvl, maxUsrLvl)
                        //1,80 daily vs 48,80 usr
                        return dl.level.min <= maxUsrLvl && dl.level.max >= minUsrLvl;
                    }))
                    let achieveIds = [];
                    if (req.query.modes) {
                        const desiredModes = req.query.modes.split(',');
                        _.difference(modes, desiredModes).forEach(umd => {
                            delete r.data[umd];
                        });
                        modes = desiredModes;
                    }
                    _.each(modes, md => {
                        achieveIds = _.uniq(achieveIds.concat(r.data[md].map(mdi => mdi.id)))
                    })
                    //now have a list of all desired achievs (or all achieves). Get actual info;
                    axios.get('https://api.guildwars2.com/v2/achievements?ids=' + achieveIds.join(','))
                        .then(ds => {
                            _.each(modes,mdd=>{
                                _.each(r.data[mdd],mdf=>{
                                    const theDly = _.find(ds.data,{id:mdf.id})
                                    mdf.desc = theDly.description;
                                    mdf.name = theDly.name;
                                    mdf.req = theDly.requirement;
                                    mdf.pic=theDly.icon
                                })
                            })
                            // res.send(r.data)
                            res.send(ds.data)
                        })
                })
            })
            .catch((e) => {
                res.status(400).send(e);
            })
    })
    router.get('/changeInterest', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            console.log('INT status', req.query.act, 'FOR', parseInt(req.query.int), usr.ints, usr.ints[parseInt(req.query.int)], req.query.act == 'true')
            // usr.ints[parseInt(req.query.int)]= req.query.act=='true'?1:0;
            if (req.query.act == 'true') {
                usr.ints.set(req.query.int, 1)
            } else {
                usr.ints.set(req.query.int, 0)
            }
            console.log('USR NOW', usr, usr.ints)
            usr.save(function(errsv, usrsv) {
                console.log('USER AFTER SAVE', usrsv, 'ERR IS', errsv)
                res.send(usrsv);
            })
        })
    })
    router.get('/changeTz', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            usr.tz = req.query.tz;
            console.log('USER TIME ZONE NOW', usr)
            usr.save((errsv, usrsv) => {
                res.send(usrsv)
            })
        })
    })
    router.post('/changeOther', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            usr.otherInfo = req.body.other;
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.post('/changeAva', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            usr.avatar = req.body.img;
            console.log('USER NOW', req.body, usr)
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.get('/charsFromAPI', this.authbit, (req, res, next) => {
        if (!req.query.api) {
            res.send('err');
        } else {
            // axios.get('https://api.guildwars2.com/v2/characters?access_token='+req.query.api,(e,r,b)=>{
            //     // res.send(b)
            //     console.log(b);
            //     const charProms = Array.from(b).map(ch=>axios.get(`https://api.guildwars2.com/v2/characters/${ch}?access_token=${req.query.api}`))
            //     Promise.all(charProms).then(r=>{
            //         res.send(r);
            //     })
            // })
            axios.get(`https://api.guildwars2.com/v2/characters?access_token=${req.query.api}`)
                .then(r => {
                    const charProms = Array.from(r.data).map(ch => axios.get(`https://api.guildwars2.com/v2/characters/${ch}?access_token=${req.query.api}`));
                    console.log(r.data, typeof r.data, charProms)
                    axios.get(`https://api.guildwars2.com/v2/characters/${r.data[0]}?access_token=${req.query.api}`)
                        .then(roc => {
                            console.log('FIRST CHAR', roc)
                        })
                    axios.all(charProms).then(rc => {
                        console.log('hi')
                        const allChars = rc.map(rcc => {
                            return {
                                name: rcc.data.name,
                                prof: rcc.data.profession,
                                race: rcc.data.race,
                                lvl: rcc.data.level
                            }
                        });
                        mongoose.model('User').findOneAndUpdate({ user: req.session.user.user }, { $set: { chars: allChars } }, (errsv, respsv) => {
                            res.send(respsv)
                        })
                        // res.send(allChars);
                    })
                })
                .catch(e => {
                    res.send('err');
                })
        }
    })
    //character stuff (add, edit, delete)
    router.post('/addChar', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            if (!usr.chars.findOne('name', req.body.name)) {
                usr.chars.push(req.body)
            }
            usr.save(function(err, ures) {
                res.send(ures);
            })
        })
    })
    router.post('/editChar', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            const charPos = usr.chars.findOne('name', req.body.name);
            if (charPos !== false) {
                usr.chars[charPos] = req.body;
            }
            usr.save(function(err, ures) {
                res.send(ures);
            })
        })
    })
    router.get('/remChar', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            const charPos = usr.chars.findOne('id', req.query.id)
            console.log('REMOVE CHAR', req.query, usr, charPos)
            if (!charPos && charPos !== 0) {
                res.status(400).send('err');
            } else {
                usr.chars.splice(charPos, 1);
                usr.save((err, usd) => {
                    res.send(usd);
                })
            }
        })
    })

    //admin stuff
    router.get('/makeMod', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOneAndUpdate({ user: req.query.user }, { $set: { mod: true } }, function(err, nm) {
            mongoose.model('User').find({}, function(err, usrs) {
                res.send(usrs.map(u => {
                    delete u.msgs;
                    return u;
                }));
            })
        })
    })
    router.get('/toggleBan', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.query.user }, function(err, usr) {
            console.log('BANNING', req.query.user, usr)
            usr.isBanned = !usr.isBanned;
            usr.save(function(err, resp) {
                mongoose.model('User').find({}, function(err, usrs) {
                    res.send(usrs.map(u => {
                        delete u.msgs;
                        return u;
                    }));
                })
            })
        })
    })
    //msg stuff
    router.post('/sendMsg', this.authbit, (req, res, next) => {
        //user sends message to another user
        console.log('SEND MSG', req.body)
        mongoose.model('User').findOne({ 'user': req.body.to }, function(err, usr) {
            if (!usr || err) {
                console.log(usr, err)
                res.send('err');
            } else {
                usr.msgs.push({
                    from: req.session.user.user,
                    date: Date.now(),
                    msg: req.body.msg
                })
                usr.save(function(err, usr) {
                    console.log('User updated!', usr, err)
                    io.emit('msgRef', { who: req.body.to }); //send out to trigger refresh
                    res.send('done');
                });
            }
        });
    });
    router.get('/delMsg', this.authbit, (req, res, next) => {
        //user deletes an old message by user and id.
        mongoose.model('User').findOne({ 'user': req.session.user.user }, function(err, usr) {
            if (!usr || err) {
                res.send('err');
            } else {
                console.log('USER', usr.user, 'MSGS', usr.msgs, 'QUERY', req.query)
                for (var i = 0; i < usr.msgs.length; i++) {
                    if (usr.msgs[i]._id == req.query.id) {
                        usr.msgs.splice(i, 1);
                        break;
                    }
                }
                usr.save(function(err, usr) {
                    req.session.user = usr;
                    res.send(usr);
                })
            }
        })
    });
    router.post('/repMsg', this.authbit, (req, res, next) => {
        //sends a message to all users flagged as 'mods' with message body, to, from
        mongoose.model('User').findOne({ user: req.session.user.user }, (erru, usr) => {
            const theMsg = usr.msgs.filter(m => m._id == req.body._id)[0];
            if (thsMsg.isRep) {
                res.send('dupRep');
                return false;
            }
            mongoose.model('User').find({ mod: true }, (err, mods) => {
                //send to each of the mods
                mods.forEach(mod => {
                    mod.msgs.push({
                        from: req.session.user.user,
                        msg: `<h3>Reported Message</h3>
                    <br>Date:${new Date(req.body.date).toLocaleString()}
                    <br>From:${req.body.from}
                    <br>To:${req.session.user.user}
                    <br>Message:${req.body.msg}`,
                        date: Date.now()
                    });
                    mod.save();
                })
                //set this msg's report status to true
                theMsg.isRep = true;
                console.log('SET ISREP TO TRUE: usr', usr, 'ID', req.body._id, 'MSG', usr.msgs.filter(m => m._id == req.body._id)[0])
                usr.save((err, usr) => {
                    res.send(usr);
                });
            })
        })
    })
    //end of msgs
    router.get('/confirm', this.authbit, isMod, (req, res, next) => {
        if (!req.query.u) {
            res.status(400).send('err')
        }
        mongoose.model('User').findOneAndUpdate({ 'user': req.query.u }, { confirmed: true }, function(err, usr) {
            if (err) {
                res.send(err);
            }
            mongoose.model('User').find({}, (erra, usra) => {
                res.send(usra);
            })
        })
    })
    router.get('/makeMod', this.authbit, isMod, (req, res, next) => {
        if (!req.query.user) {
            res.status(400).send('err')
        }
        mongoose.model('User').findOne({ 'user': req.query.user }, { mod: true }, function(err, usr) {
            if (err) {
                res.send(err);
            }
        })
    })
    router.get('/usrData', function(req, res, next) {
        mongoose.model('User').findOne({ 'user': req.query.name }, function(err, usr) {
            console.log('found:', usr)
            delete req.session.user.pass;
            delete req.session.user.salt;
            delete req.session.user.reset;
            res.send(usr);
        });
    });
    router.get('/chkLog', (req, res, next) => {
        console.log(req.session)
        if (req.session && req.session.user) {
            delete req.session.user.pass;
            delete req.session.user.salt;
            delete req.session.user.reset;
            res.send(req.session.user)
        } else {
            res.send(false)
        }
    })
    router.post('/new', function(req, res, next) {
        //record new user
        mongoose.model('User').findOne({ 'user': req.body.user }, function(err, usr) {
            if (usr || err) {
                //while this SHOULDNT occur, it's a final error check to make sure we're not overwriting a previous user.
                //Should we check for req.session?
                res.send('err')
            } else {
                const pwd = req.body.pass,
                    um = mongoose.model('User');
                delete req.body.pass;
                console.log(req.body)
                req.body.ints = [0, 0, 0, 0, 0, 0];
                um.register(new um(req.body), pwd, function(err, usr) {
                    console.log(err, usr)
                    if (err) {
                        console.log(err);
                        res.send('err');
                    } else {
                        res.send('Usr is:' + usr)
                    }
                });
            }
        })
    });
    router.get('/nameOkay', function(req, res, next) {
        mongoose.model('User').find({ 'user': req.query.name }, function(err, user) {
            console.log('USER CHECK', user);
            res.send(!user.length)
        });
    });
    router.post('/login', function(req, res, next) {
        mongoose.model('User').findOne({ 'user': req.body.user }, function(err, usr) {
            if (!usr || err) {
                res.send(false);
            } else {
                usr.authenticate(req.body.pass, function(err, resp) {
                    console.log('LOGIN RESPONSE', resp, 'ERR', err)
                    if (resp) {
                        req.session.user = resp;
                        delete req.session.user.pass;
                        delete req.session.user.salt;
                        delete req.session.user.reset;
                    }
                    if (resp.isBanned) {
                        res.status(403).send('banned');
                    }
                    res.send(req.session.user)
                })
            }
        })
    });
    router.get('/logout', function(req, res, next) {
        /*this function logs out the user. It has no confirmation stuff because
        1) this is on the backend
        2) this assumes the user has ALREADY said "yes", and
        3) logging out doesn't actually really require any credentials (it's logging IN that needs em!)
        */
        console.log('usr sez bai');
        req.session.destroy();
        res.send('logged');
    });

    router.post('/forgot', function(req, res, next) {
        //user enters password, requests reset email
        //this IS call-able without credentials, but
        //as all it does is send out a reset email, this
        //shouldn't be an issue
        mongoose.model('User').findOne({ user: req.body.user }, function(err, usr) {
            console.log(err, usr, req.body)
            if (!usr || err) {
                res.send('err');
                return;
            } else {
                var email = usr.email,
                    jrrToken = Math.floor(Math.random() * 99999).toString(32);
                for (var i = 0; i < 15; i++) {
                    jrrToken += Math.floor(Math.random() * 99999).toString(32);
                }
                var resetUrl = 'http://localhost:8080/user/reset/' + jrrToken;
                usr.reset = jrrToken;
                usr.save(function() {
                    sendpie({
                        from: 'no-reply@brethrenpain.herokuapp.com',
                        to: email,
                        subject: 'Password reset for ' + usr.name,
                        html: 'Someone (hopefully you!) requested a reset email for your Brethren [PAIN] account. <br>If you did not request this, just ignore this email.<br>Otherwise, click <a href="' + resetUrl + '">here</a>',
                    }, function(err, reply) {
                        console.log('REPLY IS', reply)
                    });
                    res.end('done')
                });
            }
        })
    });

    router.get('/reset', function(req, res, next) {
        var rst = req.query.key;
        if (!rst) {
            res.sendFile('resetFail.html', { root: './views' });
        } else {
            mongoose.model('User').findOne({ reset: rst }, function(err, usr) {
                if (err || !usr) {
                    res.sendFile('resetFail.html', { root: './views' });
                }
                res.sendFile('reset.html', { root: './views' });
            })
        }
    });
    router.get('/resetUsr', function(req, res, next) {
        var rst = req.query.key;
        if (!rst) {
            res.send('err');
        } else {
            mongoose.model('User').findOne({ reset: rst }, function(err, usr) {
                if (err || !usr) {
                    res.send('err');
                } else {
                    res.send(usr);
                }
            })
        }
    });
    router.post('/resetPwd/', function(req, res, next) {
        if (!req.body.acct || !req.body.pwd || !req.body.key) {
            res.send('err');
        } else {
            mongoose.model('User').findOne({ reset: req.body.key }, function(err, usr) {
                if (err || !usr || usr.name !== req.body.acct) {
                    res.send('err');
                } else {
                    console.log('usr before set:', usr)
                    usr.setPassword(req.body.pwd, function() {
                        console.log('usr after set:', usr)
                        usr.reset = null;
                        usr.save();
                        res.send('done')
                    });
                }
            })
        }
    })
    router.get('/clean', this.authbit, isMod, (req, res, next) => {
        mongoose.model('cal').remove({}, function(r) {
            res.send('Cleaned!')
        });
    })
    return router;
}

module.exports = routeExp;