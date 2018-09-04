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
Array.prototype.findOne = function(p,v){
    let i=0;
    if(typeof p!=='string'||!this.length){
        return false;
    }
    for(i;i<this.length;i++){
        if(this[i][p] && this[i][p]==v){
            return i;
        }
    }
    return false;
}

Array.prototype.removeOne=function(n){
    this.splice(this.indexOf(n),1);
}