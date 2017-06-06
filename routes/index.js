var express = require('express');
var router = express.Router();

//database link
var db;
var url = 'mongodb://expresscrudone:expresscrudtwo@ds143231.mlab.com:43231/expresscrud';
var result="ahi";
/* GET home page. */




router.get('/add', function(req, res, next) {

    res.render('quote-add', { title: 'Quote-Add' });
});




module.exports = router;
