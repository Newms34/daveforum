const express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    maxMsgLen = 50,
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
    };


const routeExp = function(io) {
    //TODO: need way to only let admins (?) add events. All others should get rejected?
    router.post('/new', authbit, isMod, (req, res, next) => {
        req.body.user = req.session.user.user;
        mongoose.model('cal').create(req.body, function(err, resp) {
            res.send(resp);
        })
    })
    router.get('/del', authbit, isMod, (req, res, next) => {
        console.log('deleting',req.query.id)
        mongoose.model('cal').remove({_id:req.query.id}, function(err, resp) {
            res.send(resp);
        })
    })
    router.get('/all', authbit, (req, res, next) => {
        const OneWeekAgo = Date.now() - 1000 * 3600 * 24 * 7;
        req.query.time = req.query.time && !isNaN(req.query.time) ? req.query.time : OneWeekAgo;
        mongoose.model('cal').find({ eventDate: { $gt: req.query.time } }, function(err, events) {
            if (err) {
                res.send(err)
            } else {
                res.send(events || null);
            }
        })
    })
    return router;
}
module.exports = routeExp;