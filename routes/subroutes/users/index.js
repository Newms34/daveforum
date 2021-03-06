const express = require('express');
const router = express.Router(),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    axios = require('axios'),
    fs = require('fs'),
    // SparkPost = require('sparkpost'),
    isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    };
mongoose.Promise = Promise;
// console.log('KEYS ARE',keys)
// const oldUsers = JSON.parse(fs.readFileSync('oldUsers.json', 'utf-8'))
let sgApi;
if (fs.existsSync('sparky.json')) {
    sparkyConf = JSON.parse(fs.readFileSync('sparky.json', 'utf-8'));
} else {
    sparkyConf = {
        SPARKPOST_API_KEY: process.env.SPARKPOST_API_KEY,
        SPARKPOST_API_URL: process.env.SPARKPOST_API_URL,
        SPARKPOST_SANDBOX_DOMAIN: process.env.SPARKPOST_SANDBOX_DOMAIN,
        SPARKPOST_SMTP_HOST: process.env.SPARKPOST_SMTP_HOST,
        SPARKPOST_SMTP_PASSWORD: process.env.SPARKPOST_SMTP_PASSWORD,
        SPARKPOST_SMTP_PORT: process.env.SPARKPOST_SMTP_PORT,
        SPARKPOST_SMTP_USERNAME: process.env.SPARKPOST_SMTP_USERNAME,
        SENDGRID_API: process.env.SENDGRID_API
    }
}
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sparkyConf.SENDGRID_API);


const routeExp = function (io, keys, dscrd) {
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
        const usr = JSON.parse(JSON.stringify(req.session.user));
        delete usr.pass;
        delete usr.salt;
        res.send(usr);
    });
    router.get('/memberCount', (req, res, next) => {
        //gets the count of brethren members
        axios.get(`https://api.guildwars2.com/v2/guild/${keys.apiCodes.guild}/members?access_token=${keys.apiCodes.usr}`)
            .then(r => {
                // console.log(r,'MEMBERS!')
                // const memberCount = _.zipObject(_.uniqBy(r.data,'rank').map(q=>q.rank))
                res.send(_.countBy(r.data, 'rank'))
            })
    })
    router.get('/allUsrs', this.authbit, (req, res, next) => {
        mongoose.model('User').find({}).lean().exec(function (err, usrs) {
            axios.get(`https://api.guildwars2.com/v2/guild/${keys.apiCodes.guild}/members?access_token=${keys.apiCodes.usr}`).then(rnks => {
                const au = usrs.map(u => {
                    const urnk = u.account && rnks.data.find(q => q.name.toLowerCase() == u.account.toLowerCase());
                    console.log("POSSIBLE RANK FOR", u.user, "IS", urnk)
                    u.rank = urnk && urnk.rank;
                    u.msgs = '';
                    u.pass = '';
                    u.salt = '';
                    // console.log("USER NOW", u)
                    return u;
                })
                res.send(au);
            })
        })
    });
    router.get('/setOneRead', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
        }
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
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
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            usr.msgs.forEach(m => m.read = true);
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.get('/changeInterest', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            console.log('INT status', req.query.act, 'FOR', parseInt(req.query.int), usr.ints, usr.ints[parseInt(req.query.int)], req.query.act == 'true')
            // usr.ints[parseInt(req.query.int)]= req.query.act=='true'?1:0;
            if (req.query.act == 'true') {
                usr.ints.set(req.query.int, 1)
            } else {
                usr.ints.set(req.query.int, 0)
            }
            console.log('USR NOW', usr, usr.ints)
            usr.save(function (errsv, usrsv) {
                console.log('USER AFTER SAVE', usrsv, 'ERR IS', errsv)
                res.send(usrsv);
            })
        })
    })
    router.get('/changeTz', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            usr.tz = req.query.tz;
            console.log('USER TIME ZONE NOW', usr)
            usr.save((errsv, usrsv) => {
                res.send(usrsv)
            })
        })
    })
    router.post('/changeOther', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            usr.otherInfo = req.body.other;
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.post('/changeAva', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            usr.avatar = req.body.img;
            // console.log('USER NOW', req.body, usr)
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
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!usr.chars.findOne('name', req.body.name)) {
                usr.chars.push(req.body)
            }
            usr.save(function (err, ures) {
                res.send(ures);
            })
        })
    })
    router.post('/editChar', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            const charPos = usr.chars.findOne('name', req.body.name);
            if (charPos !== false) {
                usr.chars[charPos] = req.body;
            }
            usr.save(function (err, ures) {
                res.send(ures);
            })
        })
    })
    router.get('/remChar', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
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
        mongoose.model('User').findOneAndUpdate({ user: req.query.user }, { $set: { mod: true } }, function (err, nm) {
            mongoose.model('User').find({}, function (err, usrs) {
                res.send(usrs.map(u => {
                    delete u.msgs;
                    return u;
                }));
            })
        })
    })
    router.get('/toggleBan', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.query.user }, function (err, usr) {
            console.log('BANNING', req.query.user, usr)
            usr.isBanned = !usr.isBanned;
            usr.save(function (err, resp) {
                mongoose.model('User').find({}, function (err, usrs) {
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
        mongoose.model('User').findOne({ 'user': req.body.to }, function (err, usr) {
            if (!usr || err) {
                console.log(usr, err)
                res.send('err');
            } else {
                const msgId = Math.floor(Math.random() * 9999999999999999).toString(32);
                usr.msgs.push({
                    from: req.session.user.user,
                    date: Date.now(),
                    msg: req.body.msg.replace('(msg: resetMsg)', ''),
                    msgId: msgId
                })
                usr.save(function (err, usr) {
                    console.log('User updated!', usr, err)
                    mongoose.model('User').findOne({ user: req.session.user.user }, function (err, fusr) {
                        fusr.outBox.push({
                            to: req.body.to,
                            date: Date.now(),
                            msg: req.body.msg.replace('(msg: resetMsg)', ''),
                            msgId: msgId
                        })
                        io.emit('sentMsg', { user: req.body.to, from: req.session.user.user })
                        fusr.save();
                    })
                    res.send('done');
                });
            }
        });
    });
    router.get('/delMsg', this.authbit, (req, res, next) => {
        //user deletes an old message sent TO them by user and id. this removes from inbox
        mongoose.model('User').findOne({ 'user': req.session.user.user }, function (err, usr) {
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
                usr.save(function (err, usr) {
                    req.session.user = usr;
                    res.send(usr);
                })
            }
        })
    });
    router.get('/delMyMsg', this.authbit, (req, res, next) => {
        //user deletes an old message sent FROM them by user and id. This removes from outbox
        mongoose.model('User').findOne({ 'user': req.session.user.user }, function (err, usr) {
            if (!usr || err) {
                res.send('err');
            } else {
                for (var i = 0; i < usr.outBox.length; i++) {
                    if (usr.outBox[i]._id == req.query.id) {
                        usr.outBox.splice(i, 1);
                        break;
                    }
                }
                usr.save(function (err, usr) {
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
            if (theMsg.isRep) {
                res.send('dupRep');
                return false;
            }
            console.log(theMsg, '---THE MSG')
            theMsg.isRep = true;
            console.log("REPORTING MESSAGE", req.body)
            // console.log('SET ISREP TO TRUE: usr', usr, 'ID', req.body._id, 'MSG', usr.msgs.filter(m => m._id == req.body._id)[0])
            usr.save((errfrm, usrfrm) => {
                console.log('Saved FROM report', usrfrm, errfrm, 'ORIGINAL USER REPORTING', usr, 'END USER REPING')
                io.emit('sentMsg', { user: req.session.user.user })
            });
            // throw new Error('err!')
            mongoose.model('User').find({ mod: true }, (err, mods) => {
                //send to each of the mods
                mods.forEach(mod => {
                    mod.msgs.push({
                        from: 'System',
                        msg: `<h3>Reported Message</h3>
                    <br>Date:${new Date(req.body.date).toLocaleString()}
                    <br>From:${req.body.from}
                    <br>To:${req.session.user.user}
                    <br>Message:${req.body.msg}`,
                        date: Date.now()
                    });
                    mod.save();
                })
                //now find on the SENT (outbox) of sending user
                mongoose.model('User').findOne({ user: req.body.from }, (ferr, fusr) => {
                    console.log('tryin to find message');
                    let repd = fusr.outBox.filter(orp => orp.msgId == theMsg.msgId)[0];
                    console.log(repd, fusr);
                    repd.isRep = true;
                    fusr.save((oerr, ousr) => {
                        io.emit('sentMsg', { user: req.body.from })
                        res.send(usr);
                    })
                })
            })
        })
    })
    //end of msgs
    router.get('/confirm', this.authbit, isMod, (req, res, next) => {
        if (!req.query.u) {
            res.status(400).send('err')
        }
        //find user and confirm them, then resend all users
        //check for old user from before db wipe

        mongoose.model('User').findOne({ 'user': req.query.u }, function (err, usr) {
            if (err) {
                res.send(err);
            }
            console.log('user to confirm is', usr)
            // let oldOrigUsr = oldUsers.find(u => u.user == req.query.u); //copy old users over so we dont have to
            // if (oldOrigUsr) {
            //     console.log('Old user found! is',oldOrigUsr)
            //     usr.tz = oldOrigUsr.tz;
            //     usr.msgs = _.cloneDeep(oldOrigUsr.msgs);
            //     usr.chars = _.cloneDeep(oldOrigUsr.chars);
            //     usr.ints = _.cloneDeep(oldOrigUsr.ints);
            //     usr.lastLogin = oldOrigUsr.lastLogin;
            //     usr.otherInfo = oldOrigUsr.otherInfo;
            //     usr.avatar = oldOrigUsr.avatar;
            //     usr.outBox = oldOrigUsr.outBox;
            //     usr.mod = !!oldOrigUsr.mod;
            //     // um.create(oldOrigUsr, (err, nusr) => {
            //         //     res.send(nusr);
            //         // })
            //         // usr = oldOrigUsr;
            //     }
            usr.confirmed = true;
            usr.save((cerr, cusr) => {
                console.log('err saving conf usr', cerr, 'User', cusr)
                mongoose.model('User').find({}, (erra, usra) => {
                    res.send(usra);
                })
            })
        })
    })
    router.get('/usrData', function (req, res, next) {
        if (!req.session) {
            console.log(req.session)
            throw new Error('BROKE!')
        }
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            req.session.user = usr;
            delete req.session.user.pass;
            delete req.session.user.salt;
            delete req.session.user.reset;
            delete req.session.user.email;
            res.send(req.session.user);
        })
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
    router.post('/new', function (req, res, next) {
        //record new user
        // return res.status(400).send('err')
        mongoose.model('User').findOne({ 'user': req.body.user }, function (err, usr) {
            console.log('User', usr, 'err', err)
            // err = new Error('ohshit');
            if (usr) {
                //while this SHOULDNT occur, it's a final error check to make sure we're not overwriting a previous user.
                //Should we check for req.session?
                return res.status(409).send('alreadyExists');
            } else if (!!err) {
                return res.status(400).send(err)
            } else if (req.body.account && !req.body.account.match(/^([\w]+\s*)+\.\d{4}$/)) {
                return res.status(422).send('badAcct')
            } else {
                const pwd = req.body.pass,
                    um = mongoose.model('User');
                delete req.body.pass;
                // console.log(req.body)
                req.body.ints = [0, 0, 0, 0, 0, 0];
                req.body.salt = um.generateSalt();
                req.body.pass = mongoose.model('User').encryptPassword(pwd, req.body.salt)
                um.create(req.body, (err, nusr) => {
                    res.send(nusr);
                })
            }
        })
    });
    router.get('/nameOkay', function (req, res, next) {
        mongoose.model('User').find({ 'user': req.query.name }, function (err, user) {
            console.log('USER CHECK', user);
            res.send(!user.length)
        });
    });
    router.put('/accountName', this.authbit, (req, res, next) => {
        //add/edit/delete account name
        if (!!req.query.account && !req.query.account.match(/^([\w]+\s*)+\.\d{4}$/)) {
            //probly not a valid account!
            return res.status(400).send('invalid');
        }
        console.log("USER IS", req.session.user.user)
        mongoose.model('User').findOne({ account: req.query.account, user: { $ne: req.session.user.user } }, (oerr, ousr) => {
            if (oerr) {
                return res.status(400).send('err');
            }
            if (ousr && !!req.query.account) {
                return res.status(400).send(usr);
            }
            // console.log('has save fn?',!!req.session.user.save)
            // res.send(`Would update ${req.session.user.user} to account name ${req.query.account||'(none)'}`)
            mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
                usr.account = req.query.account || '';
                usr.save((errsv, usv) => {
                    res.send('done');
                });
            });
            // req
        })
        // res.send('NOT IMPLEMENTED')
    })
    router.put('/editPwd', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (usr && usr.correctPassword(req.body.old) && req.body.pwd == req.body.pwdDup) {
                console.log('got correct pwd, changing!')
                usr.salt = mongoose.model('User').generateSalt();
                usr.oneTimePwd.has = false;
                usr.oneTimePwd.expired = false;
                usr.pass = mongoose.model('User').encryptPassword(req.body.pwd, usr.salt);
                usr.save((err, usrsv) => {
                    res.send(usrsv);
                })
            } else {
                res.send('err');
            }
        })
    })
    router.put('/login', function (req, res, next) {
        mongoose.model('User').findOne({ 'user': req.body.user }, function (err, usr) {
            console.log('User', usr, !!usr, err)
            if (!err && !!usr && !usr.isBanned && usr.correctPassword(req.body.pass) && !usr.oneTimePwd.expired) {
                const prevLog = usr.lastLogin;
                usr.lastLogin = Date.now();
                // usr.lastLogin=0;
                const lastNews = fs.readFileSync('./news.txt', 'utf8').split(/[\n\r]/).filter(q => !!q);
                // console.log('NEWS', lastNews[0], prevLog,fs.lstatSync('./news.txt'));
                let news = null;
                if (parseInt(lastNews[0]) - prevLog > 1000) {
                    console.log('adding news!')
                    news = lastNews.slice(1).map(d => d.replace(/\r/, ''));
                }
                req.session.user = usr;
                delete req.session.user.pass;
                delete req.session.user.salt;
                delete req.session.user.reset;
                delete req.session.user.email;
                if (usr.oneTimePwd.has) {
                    usr.oneTimePwd.expired = true;
                }
                usr.save((err, usrsv) => {
                    res.send({ usr: req.session.user, news: news })
                })
            } else if (usr && usr.isBanned) {
                res.send('banned')
            } else if (usr && usr.oneTimePwd && usr.oneTimePwd.expired) {
                res.send('expPwd')
            } else {
                res.send('authErr');
            }
        })
    },
        function (err, req, res, next) {
            // handle error
            console.log(err)
            res.status(401).send('DIDNT WORK')
        });
    router.get('/logout', function (req, res, next) {
        /*this function logs out the user. It has no confirmation stuff because
        1) this is on the backend
        2) this assumes the user has ALREADY said "yes", and
        3) logging out doesn't actually really require any credentials (it's logging IN that needs em!)
        */
        console.log('usr sez bai');
        req.session.destroy();
        res.send('logged');
    });

    router.post('/forgot', function (req, res, next) {
        //user enters password, requests reset email
        //this IS call-able without credentials, but
        //as all it does is send out a reset email, this
        //shouldn't be an issue
        mongoose.model('User').findOne({ user: req.body.user }, function (err, usr) {
            console.log(err, usr, req.body)
            if (!usr || err) {
                res.send('err');
                return;
            } else {
                let jrrToken = Math.floor(Math.random() * 99999).toString(32);
                for (var i = 0; i < 15; i++) {
                    jrrToken += Math.floor(Math.random() * 99999).toString(32);
                }
                if (!usr.email) {
                    res.send('err');
                    return false;
                }
                console.log(jrrToken)
                const resetUrl = req.protocol + '://' + req.get('host') + '/user/reset?key=' + jrrToken;
                usr.reset = jrrToken;
                usr.save(function () {
                    const msg = {
                        to: usr.email,
                        from: 'no-reply@brethrenpain.herokuapp.com',
                        subject: 'Password Reset',
                        text: 'Someone (hopefully you!) requested a reset email for your Brethren [PAIN] account. If you did not request this, just ignore this email. Otherwise, go to ' + resetUrl + '!',
                        html: 'Someone (hopefully you!) requested a reset email for your Brethren [PAIN] account. <br>If you did not request this, just ignore this email.<br>Otherwise, click <a href="' + resetUrl + '">here</a>',
                    };
                    sgMail.send(msg);
                    res.end('done')
                });
            }
        })
    });
    router.userCount =
        router.get('/reset', function (req, res, next) {
            //trying to get reset page using req.query. incorrect token leads to resetFail
            var rst = req.query.key;
            if (!rst) {
                console.log('NO KEY!')
                res.sendFile('resetFail.html', { root: './views' });
            } else {
                mongoose.model('User').findOne({ reset: rst }, function (err, usr) {
                    if (err || !usr) {
                        console.log('NO USER!')
                        res.sendFile('resetFail.html', { root: './views' });
                    }
                    res.sendFile('reset.html', { root: './views' });
                })
            }
        });
    router.get('/resetUsr', function (req, res, next) {
        // get user info by key for the reset.html page
        const rst = req.query.key;
        if (!rst) {
            res.send('err');
        } else {
            console.log('lookin for key:', rst)
            mongoose.model('User').findOne({ reset: rst }, function (err, usr) {
                if (err || !usr) {
                    res.send('err');
                } else {
                    res.send(usr);
                }
            })
        }
    });
    router.post('/resetPwd/', function (req, res, next) {
        if (!req.body.acct || !req.body.pwd || !req.body.key || !req.body.pwdDup || (req.body.pwdDup != req.body.pwd)) {
            res.send('err');
        } else {
            mongoose.model('User').findOne({ reset: req.body.key }, function (err, usr) {
                if (err || !usr || usr.user !== req.body.acct) {
                    res.send('err');
                } else {
                    console.log('usr before set:', usr)
                    // usr.setPassword(req.body.pwd, function() {
                    usr.salt = mongoose.model('User').generateSalt();
                    usr.pass = mongoose.model('User').encryptPassword(req.body.pwd, usr.salt)
                    usr.oneTimePwd.has = false;
                    usr.oneTimePwd.expired = false;
                    console.log('usr after set:', usr)
                    // usr.reset = null;
                    usr.save();
                    res.send('done')
                    // });
                }
            })
        }
    })
    router.get('/okayToReset', (req, res, next) => {
        mongoose.model('User').findOne({ 'user': req.query.u }, (err, usr) => {
            if (err || !usr || usr.oneTimePwd.has) {
                return res.status(400).send('NOPE');
            }
            res.send('okay!')
        })
    })
    router.get('/requestReset', (req, res, next) => {
        mongoose.model('User').find({ mod: true }, (err, mods) => {
            mods.forEach(md => {
                const msgId = Math.floor(Math.random() * 9999999999999999).toString(32);
                md.msgs.push({
                    from: req.query.u,
                    date: Date.now(),
                    msg: `User ${req.query.u} needs a password reset! Please note that clicking reset will delete this email for all other moderators!<hr><code>(msg: resetMsg)</code>`,
                    msgId: msgId
                })
                md.save();
            })
        })
    })
    router.get('/setPasswordMod', this.authbit, isMod, (req, res, next) => {
        console.log('SET PWD', req.query)
        if (!req.query.user) {
            return res.status(400).send('err');
        }
        mongoose.model('User').findOne({ user: req.query.user }, (err, usr) => {
            console.log('USR', usr, 'ERR', err)
            if (!usr || err) {
                return res.status(400).send('err');
            }
            const tempPwd = Math.floor(Math.random() * 99999999999).toString(32).toUpperCase().replace('O', 0).replace('I', 'L')//generate new pwd with no lowercase, no "I", and no "O";
            usr.salt = mongoose.model('User').generateSalt();
            usr.pass = mongoose.model('User').encryptPassword(tempPwd, usr.salt);
            usr.oneTimePwd.has = true;
            usr.oneTimePwd.expired = false;
            mongoose.model('User').find({ mod: true }, (err, mods) => {
                mods.forEach(mod => {
                    mod.msgs = mod.msgs.filter(q => !q.msg.includes('(msg: resetMsg)'));
                    if (mod.user != usr.user) {
                        mod.save();
                    }
                })
            })

            usr.save((err, usv) => {
                res.send({ pwd: tempPwd })
            });
        })
    })
    return router;
}

module.exports = routeExp;