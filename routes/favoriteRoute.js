const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();
const Favorites = require('../models/favorites')


favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200) //equivalent to res.status(200).send('OK')
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findById(req.user._id)
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findById(req.user._id)
            .then((favorite) => {
                if (favorite) {
                    req.body.map((dishToAdd) => {
                        if (!favorite.dishes.includes(dishToAdd._id)) {
                            favorite.dishes.push(dishToAdd._id)
                            favorite.save()
                                .then((fav) => {
                                    return res.status(200).json(fav)
                                })
                                .catch(err => next(err))

                        }
                        else {
                            const err = new Error("Favorites Already Exists");
                            return next(err);
                        }
                    })


                    // fav.dishes.map((dish) => {
                    //     req.body.map((dishToAdd) => {
                    //         if (!dish.equals(dishToAdd._id)) {

                    //         }
                    //     })
                    // })
                }
                else {
                    let newDishFav = [];
                    req.body.map((dishId) => {
                        newDishFav.push(dishId._id)
                    })
                    Favorites.create({ dishes: newDishFav, user: req.user._id })
                        .then((Updatedfav) => {
                            return res.status(200).json(Updatedfav)
                        })
                        .catch(err => next(err))

                }
            })
        Favorites.create(req.body)
            .then((favorite) => {
                console.log('Leader Created', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation not supported on /favorites')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.remove({}) //remove all the favorite
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200) //equivalent to res.status(200).send('OK')
    })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(req.method + ' operation not supported on ' + req.params.dishId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const dishId = req.params.dishId
        Favorites.findById(req.user._id)
            .then((fav) => {
                if (fav) {
                    if (!fav.includes(dishId)) {
                        fav.dishes.push(dishId);
                        fav.save()
                            .then((Updatedfav) => {
                                return res.status(200).json(Updatedfav)
                            })
                            .catch(err => next(err))

                    }
                    else {
                        const err = new Error("Favorites Already Exists");
                        return next(err);
                    }
                }
                else {
                    Favorites.create({ dishes: [dishId], user: req.user._id })
                        .then((Updatedfav) => {
                            return res.status(200).json(Updatedfav)
                        })
                        .catch(err => next(err));


                }
            });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findByIdAndUpdate(req.params.favoriteId, {
            $set: req.body
        }, { new: true })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findByIdAndRemove(req.params.favoriteId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });
module.exports = favoriteRouter;