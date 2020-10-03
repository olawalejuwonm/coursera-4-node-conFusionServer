const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((fav) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
    })
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        // console.log(req.body.length)
        if (fav === null) {
            if (req.body.length > 0) {
                let dishToAdd = []
                req.body.forEach((dish) => {
                    dishToAdd.push(dish._id)
                })
                Favorites.create({
                    user: req.user._id,
                    dishes: dishToAdd                                              // To Check
                }).then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav)
                }, (err) => next(err))
                .catch(err => next(err))
            }
            else {
                var err = new Error();
                err.message = "Unsupported body Type!";
                err.status = 404;
                next(err);                 
            }
        }
        else {
            if (fav.user.equals(req.user._id)) {
                console.log("favpost", fav)
                // fav.dishes.indexOf(req.body)
                if (req.body.length > 0) {
                    req.body.map(dish => {
                        // console.log(fav.dishes.indexOf(String(dish._id)))  // To Check
                            if ((fav.dishes.indexOf(String(dish._id))) == -1) {//checking if the dish is not already a fav dish
                                fav.dishes.push(dish) //this save dish to      //To save
                            }
                    });
                }
                fav.save()
                .then((fav) => {
                    Favorites.findById(fav._id)
                    .populate('user')
                    .populate('dishes')
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({fav: fav});
                    })
                }, (err) => next(err))
                .catch(err => next(err))                  
                }
        }
        
    }, (err) => next(err))
    .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav != null) {
            if (fav.user.equals(req.user._id)) {
                favSeenAndDeleted = 1
                fav.remove({})
                fav.save()
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav)
                }, (err) => next(err))
                .catch(err => next(err))
            }

    }
    else {
        console.log("delete fav user 2")
        var err = new Error();
        err.message = "You do not have a favorites!";
        err.status = 404;
        next(err);
    }
        
    }, (err) => next(err))
    .catch(err => next(err))
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites":favorites })
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites":favorites }) 
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites":favorites })                
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav != null) {
            if (fav.user.equals(req.user._id)) {
                if ((fav.dishes.indexOf(String(req.params.dishId))) == -1) {
                    fav.dishes.push(req.params.dishId) 
                    fav.save()
                    .then((fav) => {
                        Favorites.findById(fav._id)
                        .populate('user')
                        .populate('dishes')
                        .then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }, (err) => next(err))
                    .catch(err => next(err))
                }
                else {
                    var err = new Error();
                    err.message = "Dish Already Exists";
                    err.status = 403;
                    next(err);
                }
            }

    }
    else {
        let dishToAdd = []
        req.body.forEach((dish) => {
            dishToAdd.push(dish._id)
        });
        Favorites.create({
            user: req.user._id,
            dishes: dishToAdd                                              // To Check
        }).then((fav) => {
            Favorites.findById(fav._id)
            .populate('user')
            .populate('dishes')
            .then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav)
            })

        }, (err) => next(err))
        .catch(err => next(err))
    }
    })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav != null) {
            if (fav.user.equals(req.user._id)) {
                if ((fav.dishes.indexOf(String(req.params.dishId))) != -1) {
                    fav.dishes.pop(req.params.dishId)
                    fav.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    }, (err) => next(err))
                    .catch(err => next(err))

                 
                }
                
            }

        }
        else {
            var err = new Error();
            err.message = "You do not have a favorites!";
            err.status = 404;
            next(err); 
        }
    })
})
module.exports = favoriteRouter;