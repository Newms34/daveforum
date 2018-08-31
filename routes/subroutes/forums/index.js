const express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    multer = require('multer'),
    session = require('express-session'),
    maxMsgLen = 50,
    _=require('lodash'),
    oid = mongoose.Types.ObjectId,
    cats = ['general', 'missions', 'random', 'management'],
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
        mongoose.model('User').findOne({ name: req.session.user.user }, function(err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    },
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({
        storage: storage
    });


const routeExp = function(io) {
    router.post('/uploadFile',upload.any(),(req,res,next)=>{
        res.send(req.files)
    })
    router.post('/newThread', authbit, (req, res, next) => {
        mongoose.model('thread').find({ title: req.body.title }, function(err, thr) {
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
                mongoose.model('thread').create(newThr, function(err, thrd) {
                    //now create the first post(this one)
                    console.log(thrd);
                    const theCat = req.body.grp && cats.indexOf(req.body.grp) > -1 ? req.body.grp : 'general';
                    mongoose.model('post').create({
                        text: req.body.text,
                        md: req.body.md,
                        user: req.session.user.user,
                        thread: thrd._id,
                        grp: theCat,
                        file:req.body.file
                    }, function(err, thpst) {
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
    router.get('/thread',authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
            return false;
        }
        console.log("lookin for thread", req.query.id)
        mongoose.model('thread').findOne({ _id: req.query.id }, function(err, thrd) {
            if (err || !thrd) {
                res.send('err');
            } else {
                mongoose.model('post').find({ thread: thrd._id }, function(err, psts) {
                    const usrList=_.map(_.uniqBy(psts,'user'),'user');
                    console.log('RESULT OF usrList',usrList)
                    mongoose.model('User').find({user:{$in:usrList}},function(err,ufp){
                        // console.log('results of user uniq stuff for thred',_.map(ufp,(u)=>{
                        //     return u.user+u.pass.length
                        // }),usrList);
                        // ufpr = ufp.map(u=>{
                        //     return {u:u.user,a:u.avatar||false}
                        // })
                        let ufpa = _.zipObject(_.map(ufp,'user'),ufp.map(u=>u.avatar||false));
                        // console.log('USERS IN THIS THRED',ufpa)
                        // psts.forEach(function(psta){
                        //     psta.profPic = ufpa[psta.user];
                        // })
                        res.send({ thrd: thrd, psts: psts ,ava:ufpa})
                    })
                })
            }
        })
    })
    router.post('/vote', authbit, (req, res, next) => {
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
    router.get('/allByUsr', authbit, (req, res, next) => {
        mongoose.model('post').find({ user: req.session.user.name }, (err, psts) => {
            //should also get threads? or store threads on post model
            res.send(psts);
        })
    })
    router.post('/newPost', authbit, (req, res, next) => {
        if (!req.body.thread) res.status(400).send('err');
        mongoose.model('thread').findOne({ _id: req.body.thread }, (err, thrd) => {
            const thrdLen = thrd.posts.length;
            if (err || !thrd) {
                res.status(400).send('err');
            } else {
                mongoose.model('post').create({
                    text: req.body.text, //html
                    md:req.body.md,
                    user: req.session.user.user,
                    file:req.body.file||null,
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
    router.post('/editPost', authbit, (req, res, next) => {
        mongoose.model('post').findOneAndUpdate({ id: req.body.id, user: req.session.user.name }, { text: req.body.text }, (err, pst) => {
            if (err || !pst) {
                res.status(400).send('err');
            } else {
                res.send('done');
            }
        })
    })
    router.get('/cats', authbit, (req, res, next) => {
        mongoose.model('thread').find({}, function(err, grps) {
            const cats = {
                'general': { n: 0, t: -1 },
                'missions': { n: 0, t: -1 },
                'random': { n: 0, t: -1 },
                'management': { n: 0, t: -1 }
            };
            if (err || !grps || !grps.length) {
                res.send(cats);
            } else {
                //we COULD use model.collection.distinct, but that doesnt seem to return numbers in each category.
                grps.forEach(g => {
                    if (!cats[g.grp]) {
                        cats[g.grp] = { n: 1, t: 0 };
                    } else {
                        cats[g.grp].n++;
                    }
                    cats[g.grp].t = Math.max(g.createDate, cats[g.grp].t);
                })
                console.log('CATEGORIES', cats, 'GROUPS', grps);
                res.send(cats);
            }
        })
    })
    router.get('/byCat', authbit, (req, res, next) => {
        if (!req.query.grp) {
            res.send('err');
        }
        console.log('getting posts in cat', req.query.grp)
        mongoose.model('thread').find({ grp: req.query.grp }, function(err, thrds) {
            if (err) res.send('err')
            res.send(thrds || {});
        })
    })
    return router;
}
module.exports = routeExp;