const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json())

dishRouter.route('/')
.all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); //this will continue to other call on '/dishes'
})
.get( (req, res, next) => {
    res.end('Will send all dishes to you!')
})
.post((req, res, next) => {
    res.end('Will add the dish: ' + req.body.name + ' with detials: '  + req.body.description)   // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /dishes')   
})
.delete((req, res, next) => {
    res.end('Deleting all the dishes')
});


dishRouter.route('/:dishId')
.get((req, res, next) => {
    res.end('Will send detials of the dish: ' +
    req.params.dishId + ' to you')
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /dishes/' + req.params.dishId)    // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.write("Updating the dish: " + req.params.dishId + '\n') // res. write is used for writing a line to the reply message
    res.end("Will update the dish:" + req.body.name + 'with details:' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting dish:' + req.params.dishId)
});
module.exports = dishRouter;