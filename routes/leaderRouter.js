const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json())

leaderRouter.route('/')
.all((req,res,next) => { //app.all takes endpoint, callback. app.all is for all http verb(get,post,delete)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); //this will continue to other call on '/leaders'
})
.get( (req, res, next) => {
    res.end('Will send all leaders to you!')
})
.post((req, res, next) => {
    res.end('Will add the leader: ' + req.body.name + ' with detials: '  + req.body.description)   // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /leaders')   
})
.delete((req, res, next) => {
    res.end('Deleting all the leaders')
});


leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    res.end('Will send detials of the leader: ' +
    req.params.leaderId + ' to you')
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /leaders/' + req.params.leaderId)    // req.body will be body of request parsed by bodyParser
})
.put((req, res, next) => {
    res.write("Updating the leader: " + req.params.leaderId + '\n') // res. write is used for writing a line to the reply message
    res.end("Will update the leader:" + req.body.name + 'with details:' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting leader:' + req.params.leaderId)
});
module.exports = leaderRouter;