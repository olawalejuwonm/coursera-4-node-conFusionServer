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
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user:req.user._id})
            .populate('user')
            .populate('dishes') //if it doesn't find a corresponding id it won't populate it
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user:req.user._id})
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
                        else { //it will add it but prevent repetition of dish Id's
                            const err = new Error("One Or More Favorites Already Exists");
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
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(req.method + ' operation not supported on /favorites' );
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndDelete({user:req.user._id})
            .then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json(fav);
            })
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
        Favorites.findOne({user: req.user._id})
            .then((fav) => {
                if (fav) {
                    if (!fav.dishes.includes(dishId)) {
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
            })
            .catch(err => next(err));

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(req.method + ' operation not supported on ' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user:req.user._id})
            .then((favorite) => {
                if (favorite.dishes.includes(req.params.dishId)) {
                    let filteredFavs = favorite.dishes.filter((fav) => !(fav.equals(req.params.dishId)));
                    console.log("filtered favs", filteredFavs);
                    favorite.dishes = filteredFavs;
                    favorite.save()
                        .then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            return res.json(fav);
                        })
                        .catch((err) => next(err));  
                }
                else {
                    return res.status(304).json({status: "already deleted"});
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));
    });
module.exports = favoriteRouter;