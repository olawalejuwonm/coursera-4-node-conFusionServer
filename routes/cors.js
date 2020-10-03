const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:3001'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin')) !== -1 ) { //check if the req origin is present in the whitelist, index of will return -1 if it can't find it
        corsOptions = { origin: true }; //cors module will reply that access control allow origin

    } 
    else {
        corsOptions = { origin: false }; //access controll allow origin will be false
    }
    callback(null, corsOptions)
}

exports.cors = cors(); //if this is done without any options it will give acces control allow origin with wild cards toll.useful for get operations
exports.corsWithOptions = cors(corsOptionsDelegate);