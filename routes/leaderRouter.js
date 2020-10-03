const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
const Leaders = require('../models/leaders')


leaderRouter.use(bodyParser.json())

leaderRouter.route('/')
.get( (req, res, next) => {
    Leaders.find({})
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => next(err))
    .catch((err) => next(err)); 
})
.post((req, res, next) => {
   // res.end('Will add the leader: ' + req.body.name + ' with detials: '  + req.body.description)   // req.body will be body of request parsed by bodyParser
   Leaders.create(req.body)
   .then((leader) => {
       console.log('Leader Created', leader);
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(leader);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /leaders')   
})
.delete((req, res, next) => {
    Leaders.remove({}) //remove all the leader
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /leaders/' + req.params.leaderId)    // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, { new: true })
    .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports = leaderRouter;