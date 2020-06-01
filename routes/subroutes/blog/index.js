const express = require('express'),
    router = express.Router(),
    // Discord = require('discord.js'),
    mongoose = require('mongoose'),
    _ = require('lodash');


const routeExp = function(io,keys,dscrd) {
    this.blogParams = ['title','txtMd'];
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
        mongoose.model('User').findOne({ user: req.session.user.user }, function(err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    }
    this.checkBody = function(arr){ 
       return (req,res,next)=>{
           return !!arr.filter(q=>!req.body[q]).length?res.status(422).send('missing'):next();
       }
    }

    router.get('/blogs',(req,res,next)=>{
        const lim = !isNaN(Number(req.query.n))?Number(req.query.n):10,
        fo = {};
        if(req.query.s && Number(req.query.s)>0){
            fo.timeCreated={$lt:req.query.s}
        }
        mongoose.model('blog').find(fo).sort({'timeCreated':-1}).limit(lim).exec((err,blgs)=>{
            res.send(blgs);
        })
    })
    router.get('/allBlogs',this.authbit,this.isMod, (req,res,next)=>{
        mongoose.model('blog').find({}).sort({'timeCreated':-1}).exec((err,blgs)=>{
            res.send(blgs);
        })
    })
    router.get('/blog', this.authbit, (req,res,next)=>{
        //get single blog by id
        mongoose.model('blog').findOne({pid:req.query.pid},(err,blg)=>{
            res.send(blg);
        })
    })
    router.post('/blog',this.authbit,this.checkBody(this.blogParams),(req,res,next)=>{
        mongoose.model('blog').findOne({title:req.body.title},(err,bp)=>{
            if(err){
                return res.status(400).send('err');
            }else if(bp){
                return res.status(409).send('dup');
            }
            delete req.body.time;
            delete req.body.timeCreated;
            delete req.body.pid;
            req.body.announceToDiscord = !!req.body.announceToDiscord;//ensure bool
            req.body.txtHtml = req.body.txtMd.sanAndParse().md2h();
            if(!!req.body.announceToDiscord){
                const msg = dscrd.genBrethrenMsg(req.body,req.session.user);
                // console.log(msg)
                dscrd.channels.cache.get('712152017706942504').send(msg);
            }
            req.body.time = Date.now();
            req.body.timeCreated = Date.now();
            mongoose.model('blog').create(req.body,(errsv,blgsv)=>{
                // console.log('ERR',errsv,'BLOG',blgsv)
                res.send(blgsv);
            })
        })
    })
    router.put('/blog',this.authbit,this.checkBody(this.blogParams.concat(['pid'])),(req,res,next)=>{
        //edit blog
        mongoose.model('blog').findOne({pid:req.body.pid},(err,pst)=>{
            if(err||!pst){
                return res.status(400).send('err');
            }
            Object.keys(req.body).forEach(p=>{
                if(p=='pid'||p=='timeCreated'){
                    return false;
                }else if(p == 'time'){
                    pst[p]=Date.now();
                }else if(p=='announceToDiscord'){
                    pst[p]== !!req.body.announceToDiscord;//ensure bool
                    req.body.txtHtml = req.body.txtMd.sanAndParse().md2h();
                }else{
                    pst[p] = req.body[p];
                }
            })
            if(!!pst.announceToDiscord){
                const msg = dscrd.genBrethrenMsg(pst,req.session.user);
                // console.log(msg)
                dscrd.channels.cache.get('712152017706942504').send(msg);
            }
            pst.save((errpp,svpp)=>{
                res.send(svpp)
            })
        })
    })
    router.delete('/blog',this.authbit,(req,res,next)=>{
        if(!req.query.pid){
            return res.status(400).send('err');
        }
        // return res.send(req.query);
        mongoose.model('blog').findOneAndDelete({
            pid:req.query.pid
        },(errd,pstd)=>{
            res.send(pstd);
        })
    })
    
    return router;
}
module.exports = routeExp;