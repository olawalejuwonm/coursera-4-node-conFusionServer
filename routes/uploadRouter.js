const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate')
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { //cb is callback
    cb(null, 'public/images'); //first param is error
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname) //file.originalname gives you the original name of a file and not a string
  }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //reg expression to check if the file extension dosen't match any of these  
        return cb(new Error('You can upload only image files!'), false)
    }
    cb(null, true);
}

const upload = multer({ storage: storage, filefilter: 
imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload')   
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
upload.single('imageFile'), (req, res) => { //upload.single('imageFile') allow to upload a single file, the name imageFile will be in the multipart
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); 
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload')   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, 
    authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload')   
})


module.exports = uploadRouter;