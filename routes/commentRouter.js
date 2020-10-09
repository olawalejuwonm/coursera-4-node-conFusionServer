const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')
const Comments = require('../models/comments');
const cors = require('./cors');
const Dishes = require('../models/dishes');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json())

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200) //equivalent to res.status(200).send('OK')
    })
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
            req.body.author = req.user._id;
            Comments.create(req.body)
                .then((comment) => {
                    Comments.findById(comment._id)
                        .populate('author')
                        .then((comment) => {
                            return res.status(200).json(comment);
                        })
                }, (err) => next(err))
                .catch((err) => next(err));
        }
        else {
            const err = new Error('Comments not found in request body');
            err.status = 404;
            return next(err);
        }

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation not supported on /Comments');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({})
            .then((resp) => {
                return res.status(200).json(resp)
            }, (err) => next(err))
            .catch((err) => next(err));
    });


commentRouter.route('/:commentId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200) //equivalent to res.status(200).send('OK')
    })
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
        res.end('Post operation not supported on /Comments/' + req.params.commentId)    // req.body will be body of request parsed by bodyParser
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    if (!comment.author.equals(req.user._id)) {
                        const err = new Error("You Are Not Authorized To Modify This Comment!");
                        err.status = 403;
                        return next(err);
                    }
                    req.body.author = req.user._id;
                    // if (req.body.rating) {
                    //     dish.comments.id(req.params.commentId).rating = req.body.rating;
                    // }
                    // if (req.body.comment) {
                    //     dish.comments.id(req.params.commentId).comment = req.body.comment;
                    // }
                    Comments.findByIdAndUpdate(req.params.commentId, {
                        $set: req.body
                    }, {
                        new: true
                    })
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
                    err = new Error('Comment' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    if (!comment.author.equals(req.user._id)) {
                        const err = new Error("You Are Not Authorized To Delete This Comment!");
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

module.exports = commentRouter