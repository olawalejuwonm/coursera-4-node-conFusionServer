const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json())

promoRouter.route('/')
.all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); //this will continue to other call on '/promoes'
})
.get( (req, res, next) => {
    res.end('Will send all promotions to you!')
})
.post((req, res, next) => {
    res.end('Will add the promo: ' + req.body.name + ' with detials: '  + req.body.description)   // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /promotions')   
})
.delete((req, res, next) => {
    res.end('Deleting all the promos')
});


promoRouter.route('/:promoId')
.get((req, res, next) => {
    res.end('Will send detials of the promo: ' +
    req.params.promoId + ' to you')
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /promotions/' + req.params.promoId)    // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.write("Updating the promotion: " + req.params.promoId + '\n') // res. write is used for writing a line to the reply message
    res.end("Will update the promotion:" + req.body.name + 'with details:' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting promotion:' + req.params.promoId)
});
module.exports = promoRouter;