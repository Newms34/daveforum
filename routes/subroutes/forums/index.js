const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multer = require('multer'),
    maxMsgLen = 50,
    _ = require('lodash'),
    cats = ['general', 'missions', 'random', 'management'],
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({
        storage: storage
    });


const routeExp = function (io, keys) {
    // router.post('/uploadFile', upload.any(), (req, res, next) => {
    //     res.send(req.files)
    // })
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
    this.isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    }
    router.post('/thread', this.authbit, (req, res, next) => {
        mongoose.model('thread').find({ title: req.body.title }, function (err, thr) {
            console.log('THREAD', req.body)
            if (thr && thr.length) {
                res.send('err');
            } else {
                const newThr = {
                    user: req.session.user.user,
                    grp: req.body.grp || 'general',
                    open: req.body.open,
                    stickied: req.body.stickied,
                    createDate: req.body.createDate,
                    title: req.body.title,
                    lastUpd: req.body.lastUpd
                }
                mongoose.model('thread').create(newThr, function (err, thrd) {
                    //now create the first post(this one)
                    console.log(thrd);
                    const theCat = req.body.grp && cats.indexOf(req.body.grp) > -1 ? req.body.grp : 'general';
                    mongoose.model('post').create({
                        text: req.body.md.sanAndParse().md2h(),
                        md: req.body.md,
                        user: req.session.user.user,
                        thread: thrd._id,
                        grp: theCat,
                        file: req.body.file
                    }, function (err, thpst) {
                        thrd.posts.push({
                            id: thpst._id,
                            order: 0,
                            votesUp: [req.session.user.user]
                        })
                        thrd.lastUpd = Date.now();
                        thrd.save();
                        res.send('done');
                    })
                })
            }
        })
    });
    router.get('/thread', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
            return false;
        }
        console.log("lookin for thread", req.query.id)
        mongoose.model('thread').findOne({ _id: req.query.id }, function (err, thrd) {
            if (err || !thrd) {
                res.send('err');
            } else {
                mongoose.model('post').find({ thread: thrd._id }, function (err, psts) {
                    const usrList = _.map(_.uniqBy(psts, 'user'), 'user');
                    console.log('RESULT OF usrList', usrList)
                    mongoose.model('User').find({ user: { $in: usrList } }, function (err, ufp) {
                        //user forum post avatar (ufpa)
                        let ufpa = _.zipObject(_.map(ufp, 'user'), ufp.map(u => u.avatar || false));

                        res.send({ thrd: thrd, psts: psts, ava: ufpa, mods: ufp.filter(um => um.mod).map(umn => umn.user) })
                    })
                })
            }
        })
    })
    router.post('/vote', this.authbit, (req, res, next) => {
        // const voteChange = !!req.body.voteUp?1:-1;
        mongoose.model('thread').findOne({ _id: req.body.thread }, (err, thrd) => {
            // console.log('thred',thrd)
            const thePst = thrd.posts.filter(psf => psf.id == req.body.post)[0];
            //not already voted up
            if (!!req.body.voteUp && thePst.votesUp.indexOf(req.session.user.user) < 0) {
                thePst.votesUp.push(req.session.user.user);
            } else if (!!req.body.voteUp) {
                thePst.votesUp.removeOne(req.session.user.user);
            }

            if (!req.body.voteUp && thePst.votesDown.indexOf(req.session.user.user) < 0) {
                thePst.votesDown.push(req.session.user.user);
            } else if (!req.body.voteUp) {
                thePst.votesDown.removeOne(req.session.user.user);
            }



            //if we're 'switching' votes
            if (!!req.body.voteUp && thePst.votesDown.indexOf(req.session.user.user) > -1) {
                thePst.votesDown.removeOne(req.session.user.user);
            }

            if (!req.body.voteUp && thePst.votesUp.indexOf(req.session.user.user) > -1) {
                thePst.votesUp.removeOne(req.session.user.user);
            }
            thrd.save((err, thrdn) => {
                res.send(thrd);
            })
        })
    })
    router.get('/allByUsr', this.authbit, (req, res, next) => {
        mongoose.model('post').find({ user: req.session.user.name }, (err, psts) => {
            //should also get threads? or store threads on post model
            res.send(psts);
        })
    })
    router.post('/post', this.authbit, (req, res, next) => {
        if (!req.body.thread) res.status(400).send('err');
        mongoose.model('thread').findOne({ _id: req.body.thread }, (err, thrd) => {
            const thrdLen = thrd.posts.length;
            if (err || !thrd || !thrd.open) {
                res.status(400).send('err');
            } else {
                mongoose.model('post').create({
                    text: req.body.md.sanAndParse().md2h(), //html
                    md: req.body.md,
                    user: req.session.user.user,
                    file: req.body.file || null,
                    thread: req.body.thread, //ID of parent thread.
                }, (err, pst) => {
                    thrd.posts.push({
                        id: pst._id,
                        order: thrdLen,
                        votesUp: [req.session.user.user]
                    })
                    thrd.lastUpd = Date.now();
                    thrd.save((err, resp) => {
                        res.send('done');
                    })
                })
            }
        })
    })
    router.put('/post', this.authbit, (req, res, next) => {
        // return res.send(req.session.user)
        console.log('editing post',req.body)
        if (req.session.user.user != req.body.user && !req.session.user.mod) {
            return res.status(401).send('wrongUsr');
        } else if (req.session.user.user != req.body.user) {
            //if this edit was done by a mod, write that
            req.body.editedByMod = req.session.user.user;
        }
        mongoose.model('post').findOne({ _id: req.body._id }, (err, pst) => {
            /* {
                text: req.body.md.sanAndParse().md2h(),
                md:req.body.md,
                editedByMod:req.body.editedByMod||
            } */
            if(!!pst.isLocked && !req.session.user.mod){
                return res.status(403).send('err');
            }
            pst.md = req.body.md;
            pst.text = req.body.md.sanAndParse().md2h();
            pst.lastUpd = Date.now();
            pst.editedByMod = req.body.editedByMod || '';
            pst.save((errsv, pstsv) => {
                if (err || !pst) {
                    res.status(400).send('err');
                } else {
                    res.send('done');
                }
            })
        })
    })
    router.put('/removePost',this.authbit,this.isMod,(req,res,next)=>{
        // if you're wondering why this is a PUT route, it's because we don't actually remove the post
        mongoose.model('User').findOne({user: req.session.user.user},(erru,usr)=>{
            if(!usr.correctPassword(req.body.pwd)){
                return res.status(401).send('err');
            }
            mongoose.model('post').findOne({_id:req.body.pst._id},(err,pst)=>{
                if(!!err||!pst){
                    return res.status(400).send('err');
                }
                pst.editedByMod = req.session.user.user;
                pst.md = `[c='red'](Post removed by moderator)[/c]`;
                pst.text = `<span style='color:red'>(Post removed by moderator)</span>`;
                pst.profPic = null;
                pst.file=null;
                pst.lastUpd = Date.now();
                pst.isLocked = true;
                pst.save((a,b)=>{
                    res.send(req.body);
                })
            })
        })
    })
    router.get('/cats', (req, res, next) => {
        mongoose.model('thread').find({}, function (err, grps) {
            const cats = {
                'general': { n: 0, t: -1 },
                'missions': { n: 0, t: -1 },
                'random': { n: 0, t: -1 },
                'management': { n: 0, t: -1 }
            };
            if (err || !grps || !grps.length) {
                console.log('NOCATS')
                res.send(cats);
            } else {
                //we COULD use model.collection.distinct, but that doesnt seem to return numbers in each category.
                grps.forEach(g => {
                    if (!cats[g.grp]) {
                        cats[g.grp] = { n: 1, t: 0 };
                    } else {
                        cats[g.grp].n++;
                    }
                    cats[g.grp].t = Math.max(g.lastUpd, cats[g.grp].t);
                })
                console.log('CATEGORIES', cats, 'GROUPS', grps);
                res.send(cats);
            }
        })
    })
    router.get('/byCat', this.authbit, (req, res, next) => {
        if (!req.query.grp) {
            res.send('err');
        }
        console.log('getting posts in cat', req.query.grp)
        mongoose.model('thread').find({ grp: req.query.grp }, function (err, thrds) {
            if (err) res.send('err')
            res.send(thrds || {});
        })
    })
    router.post('/searchThr', (req, res, next) => {
        if (!req.body.term) {
            res.status(400).send('err');
        }
        console.log("Lookin for", req.body.term)
        //First we search by thread title, THEN by individual posts
        mongoose.model('thread').find({ $text: { $search: req.body.term } }, function (err, thrds) {
            console.log('ERR?', err)
            // res.send(thrd)
            mongoose.model('post').find({ $text: { $search: req.body.term } }, function (err, psts) {
                // //need to re-find each thread 'cat' for posts
                console.log('threads for these posts:', _.uniqBy(psts, 'thread').map(p => p.thread))
                mongoose.model('thread').find({ _id: { $in: _.uniqBy(psts, 'thread').map(p => p.thread) } }, function (err, pt) {
                    console.log('threads for these posts', pt)
                    //pt is list of threads for posts. psts is list of posts that match initial search terms
                    let pstsOut = psts.map(p => {
                        let theThread = pt.filter(tf => tf._id == p.thread)[0],
                            pn = {};
                        console.log('Doin post', p, 'for thread', theThread)
                        pn.thrTitle = theThread.title;
                        pn.thrGrp = theThread.grp;
                        ['createDate', 'lastUpd', 'file', 'profPic', '_id', 'text', 'md', 'user', 'thread'].forEach(term => {
                            pn[term] = p[term];
                        })
                        console.log('PN now', pn)
                        return pn;
                    })
                    res.send({ thrds: thrds, psts: pstsOut })
                })
            })
        })
    })
    //thread status toggles
    router.get('/toggleLock', this.authbit, this.isMod, (req, res, next) => {
        mongoose.model('thread').findOne({ _id: req.query.id }, (err, thr) => {
            thr.open = !thr.open;
            thr.save((err, resp) => {
                res.send('done');
            })
        })
    })
    router.get('/toggleSticky', this.authbit, this.isMod, (req, res, next) => {
        mongoose.model('thread').findOne({ _id: req.query.id }, (err, thr) => {
            thr.stickied = !thr.stickied;
            thr.save((err, resp) => {
                console.log('Toggled thread sticky! now is', thr.stickied)
                res.send('done');
            })
        })
    })
    router.delete('/deleteThread', this.authbit, this.isMod, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
            return false;
        }
        console.log('FIND AND REMOVE---------', mongoose.model('post').remove)
        // res.send('no')
        mongoose.model('thread').findByIdAndRemove(req.query.id, (err, doc) => {
            mongoose.model('post').remove({ thread: req.query._id }, (perr, pdoc) => {
                res.send('done')
            })
        })
    })
    return router;
}
module.exports = routeExp;