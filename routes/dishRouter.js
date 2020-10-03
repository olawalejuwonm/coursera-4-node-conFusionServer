const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Dishes = require('../models/dishes');


const dishRouter = express.Router();

dishRouter.use(bodyParser.json())

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next(); //this will continue to other call on '/dishes'
// })
.get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err)); //this will send the err to overall error catch
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,  (req, res, next) => { //req,res,next will be pass in to  authenticate.verifyAdmin
    // console.log(req.user.admin)
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /dishes')   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({}) //remove all the dish
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /dishes/' + req.params.dishId)    // req.body will be body of request parsed by bodyParser
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // res.write("Updating the dish: " + req.params.dishId + '\n') // res. write is used for writing a line to the reply message
    // res.end("Will update the dish:" + req.body.name + 'with details:' + req.body.description);
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// dishRouter.route('/:dishId/comments')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// // .all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
// //     res.statusCode = 200;
// //     res.setHeader('Content-Type', 'text/plain');
// //     next(); //this will continue to other call on '/dishes'
// // })
// .get(cors.cors, (req, res, next) => {
//     Dishes.findById(req.params.dishId)
//     .populate('comments.author')
//     .then((dish) => {
//         if (dish != null) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(dish.comments);
//         }
//         else {
//             err = new Error('Dish' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);

//         }
        
//     }, (err) => next(err))
//     .catch((err) => next(err)); //this will send the err to overall error catch
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { //authenticate.verifyUser will pass in object._id
//     Dishes.findById(req.params.dishId)
//     .then((dish) => {
//         if (dish != null) {
//             console.log('body of post requst', req.body)
//             req.body.author = req.user._id //authenticate.verifyUser will pass in object._id from jwt_payload
//             //the id must be same as user id because user models is the ref and needs to be populated, if not provided
//             //the author won't be populated
//             dish.comments.push(req.body);
//             dish.save()
//             .then((dish) => {
//                 Dishes.findById(dish._id)
//                     .populate('comments.author')
//                     .then((dish) => {
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(dish);
//                     })
                
//             }, (err) => next(err));
//         }
//         else {
//             err = new Error('Dish' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);

//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('Put operation not supported on /dishes' +
//      req.params.dishId + '/comments' );
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Dishes.findById(req.params.dishId)
//     .then((dish) => {
//         if (dish != null) {
//             for (var i = (dish.comments.length - 1); i >= 0; i--) {
//                 dish.comments.id(dish.comments[i]._id).remove();
//             }
//             dish.save()
//             .then((dish) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(dish);
//             }, (err) => next(err));
//         }
//         else {
//             err = new Error('Dish' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);

//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });


// dishRouter.route('/:dishId/comments/:commentId')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.cors, (req, res, next) => {
//     Dishes.findById(req.params.dishId)
//     .populate('comments.author')
//     .then((dish) => {
//         if (dish != null && dish.comments.id(req.params.commentId) != null) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(dish.comments.id(req.params.commentId));
//         }
//         else if (dish == null) {
//             err = new Error('Dish' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);

//         }
//         else {
//             err = new Error('Comment' + req.params.commentId + ' not found');
//             err.status = 404;
//             return next(err);            
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('Post operation not supported on /dishes/' + req.params.dishId + 
//     '/comments/ ' + req.params.commentId)    // req.body will be body of request parsed by bodyParser
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Dishes.findById(req.params.dishId)
//     .then((dish) => {
//         if (dish != null && dish.comments.id(req.params.commentId) != null) {
//             dish.comments.map((comment) => {
//                 // console.log(comment.author)
//                 // console.log(comment)
//                 if (comment.author.equals(req.user.id)) {
//                     console.log("True")
//                     if (dish != null && dish.comments.id(req.params.commentId) != null) { //search the comments by id using comments.id
//                         if (req.body.rating) {
//                             dish.comments.id(req.params.commentId).rating = req.body.rating;
//                         }
//                         if (req.body.comment) {
//                             dish.comments.id(req.params.commentId).comment = req.body.comment
//                         }
//                         dish.save()
//                         .then((dish) => {
//                             Dishes.findById(dish._id)
//                             .populate('comments.author')
//                             .then((dish) => {
//                                 res.statusCode = 200;
//                                 res.setHeader('Content-Type', 'application/json');
//                                 res.json(dish);
//                             })
//                         }, (err) => next(err));
//                     }
//                 }

//                 else {
//                     var err = new Error();
//                     err.status = 403;
//                     err.message = "You are not allowed top perform this operation"
//                     return next(err)
//                 }
//             })
//         }
//         else if (dish == null) {
//             err = new Error('Dish' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);

//         }
//         else {
//             err = new Error('Comment' + req.params.commentId + ' not found');
//             err.status = 404;
//             return next(err);            
//         }

//     }, (err) => next(err))
//     .catch((err) => next(err))

// })
//         // console.log(dish.comments.req.params.commentId)
// .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Dishes.findById(req.params.dishId)
//     .then((dish) => {
//         if (dish != null && dish.comments.id(req.params.commentId) != null) {

//             dish.comments.map((comment) => {
//                 if (comment.author.equals(req.user.id)) {
//                     if (dish != null && dish.comments.id(req.params.commentId) != null) {
//                         dish.comments.id(req.params.commentId).remove();
//                         dish.save()
//                         .then((dish) => {
//                             Dishes.findById(dish._id)
//                             .populate('comments.author')
//                             .then((dish) => {
//                                 res.statusCode = 200;
//                                 res.setHeader('Content-Type', 'application/json');
//                                 res.json(dish);
//                             })               
//                         }, (err) => next(err));
//                     }  
//                 }
//                 else {
//                     var err = new Error();
//                     err.status = 403;
//                     err.message = "You are not allowed top perform this operation"
//                     return next(err)      
//                 }
//             })
//         }
//         else if (dish == null) {
//             err = new Error('Dish ' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Comment ' + req.params.commentId + ' not found');
//             err.status = 404;
//             return next(err);            
//         }

//     }, (err) => next(err))
//     .catch((err) => next(err));
// });
module.exports = dishRouter;