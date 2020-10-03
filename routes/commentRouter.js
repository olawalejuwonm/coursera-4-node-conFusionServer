const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Comments = require('../models/comments');


const commentRouter = express.Router();

commentRouter.use(bodyParser.json())

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next(); //this will continue to other call on '/dishes'
// })
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err)); //this will send the err to overall error catch
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { //authenticate.verifyUser will pass in object._id
    if (req.body != null) {
        req.body.author = req.user._id; //authenticate.verifyUser will pass in object._id from jwt_payload
        //     //the id must be same as user id because user models is the ref and needs to be populated, if not provided
        //     //the author won't be populated
        Comments.create(req.body)
        .then((comment) => {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Comment not found in the request body');
        err.status = 404;
        return next(err);
    }
    
        //     console.log('body of post requst', req.body)
        //     req.body.author = req.user._id //authenticate.verifyUser will pass in object._id from jwt_payload
        //     //the id must be same as user id because user models is the ref and needs to be populated, if not provided
        //     //the author won't be populated
        
       // }
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /comments' );
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);    
    }, (err) => next(err))
    .catch((err) => next(err));
});


commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /comments/' + req.params.commentId)    // req.body will be body of request parsed by bodyParser
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to update this comment!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(req.params.commentId, {
                $set: req.body
            }, { new: true }) //new will ensure that updated comment is returned
            .then((comment) => {
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
        // console.log(dish.comments.req.params.commentId)
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this comment!');
                err.status = 403;
                return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = commentRouter;