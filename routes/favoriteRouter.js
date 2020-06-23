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
.get(authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
        .populate('user')
        .populate('dishes')
        .then((favs) => {
            if (favs.length > 0) {
                favs.forEach((fav) => {
                    if (fav.user.equals(req.user._id)) {
                        favGotten = 1
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        console.log("fav user id")
                        res.json(fav)
                    }
                })
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favs)  
            }
            if (typeof favGotten === 'undefined') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json([]);
            }
            
            
        }, (err) => {next(err)})
        .catch((err) => next(err))
})

// Dishes.find({}).then((dishes) => {
//     var DishIds = [];
//     dishes.map((dish) => {
//         DishIds.push(String(dish._id))
//     })
//     console.log(DishIds)
//     req.body.forEach(dish => {
//         // if (DishIds.indexOf(dish.id)) {
//             console.log(DishIds.indexOf(String(dish._id)))
//             // DishIds.push(dish._id)
//         // }
//         console.log(String(dish._id))
//     });

//     if (req.user) { //req.user is everything in my user schema
//         Favorites.findById(req.user._id)
//         .populate('user')
//         .populate('dishes')
//         .then((favs) => {
//             var theReq = [];
//             theReq.push(req.body)
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json({response: req.user, favs: favs, dish: dishes,
//             finalreq: theReq, DishIds: DishIds})
//         }, (err) => {next(err)})
//         .catch((err) => next(err))
        
        
//     }
//     else {
//         var err = new Error('you are not authenticated')
//         next(err)
//     }  
// })

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favs) => {
        // console.log(req.body.length)
        if (favs.length == 0 && req.body.length > 0) {
            console.log("so", favs.length)
            let dishToAdd = []
            req.body.forEach((dish) => {
                dishToAdd.push(dish._id)
            })
            Favorites.create({
                user: req.user._id,
                dishes: dishToAdd                                              // To Check
            }).then((favs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favs)
            }, (err) => next(err))
            .catch(err => next(err))
        }
        else {
            console.log("else so", favs.user)
            favs.forEach(fav => {
                console.log("inside the loop")
                // console.log(req.user._id, fav.user)
                if (fav.user.equals(req.user._id)) {
                    console.log("inside the check")
                    userFavExist = 1
                    // fav.dishes.indexOf(req.body)
                    if (req.body.length > 0) {
                        req.body.forEach(dish => {
                            console.log(fav.dishes.indexOf(String(dish._id)))  // To Check
                            if ((fav.dishes.indexOf(String(dish._id))) == -1) {  //checking if the dish is not already a fav dish
                                console.log("inside index")
                                fav.dishes.push(dish) //this save dish to      //To save
                            }
                            //if dish alredy exists it will skip it
                        console.log(String(dish._id))
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
            });
            if (typeof userFavExist === 'undefined' && req.body.length > 0) {
                console.log("inside user fav")
                let dishToAdd = []
                req.body.forEach((dish) => {
                    dishToAdd.push(dish._id)
                })
                Favorites.create({
                    user: req.user._id,
                    dishes: dishToAdd                                              // To Check
                }).then((favs) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs)
                }, (err) => next(err))
                .catch(err => next(err))
            }

            // res.statusCode = 400;
            // res.setHeader('Content-Type', 'application/json');
            // res.json({Err: "Not an array"})            
            // Favorites.save()
            
        }
        
    }, (err) => next(err))
    .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favs) => {
        if (favs.length > 0) {
            favs.map((fav) => {
                if (fav.user.equals(req.user._id)) {
                    console.log("delete fav user")
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
            })

        }
        if (typeof favSeenAndDeleted === 'undefined') {
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
    // res.statusCode = 403;
    // res.setHeader('Content-Type', 'text/plain');
    // res.end('GET operation not supported on /favorites/'+ req.params.dishId)
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
    Favorites.find({})
    .then((favs) => {
        if (favs.length > 0) {
            console.log(favs)
            favs.map((fav) => {
                if (fav.user.equals(req.user._id)) {
                    favAvaialable = 1
                    if ((fav.dishes.indexOf(String(req.params.dishId))) == -1) {
                        favSeenAndPushedOneDish = 1  
                        fav.dishes.push(req.params.dishId) 
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
            })

        }
        if (typeof favAvaialable === 'undefined') {
            Favorites.create({
                user: req.user._id,
                dishes: req.params.dishId                                      
            }).then((favs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favs)
            }, (err) => next(err))
            .catch(err => next(err))  
        }
        if (typeof favSeenAndPushedOneDish === 'undefined' && favAvailable == 1) {
            var err = new Error();
            err.message = "You do not have a favorites!";
            err.status = 404;
            next(err);
        }
    })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
    .then((favs) => {
        if (favs.length > 0) {
            // console.log(favs)
            favs.map((fav) => {
                if (fav.user.equals(req.user._id)) {
                    favToDeleteAvaialable = 1
                    if ((fav.dishes.indexOf(String(req.params.dishId))) != -1) {
                        favSeenAndDeleteOneDish = 1  
                        fav.dishes.pop(req.params.dishId) 
                    }
                    fav.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav)
                    }, (err) => next(err))
                    .catch(err => next(err))
                }
            })

        }
        if (typeof favToDeleteAvaialable === 'undefined') {
            var err = new Error();
            err.message = "You do not have a favorites!";
            err.status = 404;
            next(err); 
        }
        // if (typeof favSeenAndDeleteOneDish === 'undefined' && favAvailable == 1) {
        //     var err = new Error();
        //     err.message = "You do not have a favorites!";
        //     err.status = 404;
        //     next(err);
        // }
    })
})
module.exports = favoriteRouter;