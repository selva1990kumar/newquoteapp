var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

//var flash = require('connect-flash');


var app = express();
var sessionStore = new session.MemoryStore;


var db;
var url = 'mongodb://expresscrudone:expresscrudtwo@ds143231.mlab.com:43231/expresscrud';

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', index);
app.use('/users', users);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());

// for flash message
/*
app.use(session({
    maxAge: 600000,
    secret: 'secret',
     proxy: true,
    resave: true,
    saveUninitialized: true
}));
*/

// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

app.get('/', function(req, res, next) {

    MongoClient.connect(url, function(err, db) {
        db.collection('quotes').find().toArray(function (err, result) {
          //  console.log(result);
            res.render('index', { title: 'List Of Quote About Life' , quoterows:result});

        });
    });

});

app.post('/add', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        db.collection('quotes').save(req.body, function(err, result) {
            console.log('saved to database');
            console.log(req.body);
            res.redirect('/');
        });
    });
});

app.get('/edit/:id', function(req, res) {
    var k = req.params.id;
    MongoClient.connect(url, function(err, db) {

        db.collection('quotes').find( { _id: ObjectId(req.params.id)} ).toArray(function (err, result) { // no need to give '' for object id values
            console.log(result);
            res.render('edit', { title: 'List Of Quote About Life' , quoterows:result});


        });
    });
});

app.post('/edit', function(req, res) {
    var k = req.body.id;
    console.log(req.body);
    MongoClient.connect(url, function(err, db) {
       db.collection('quotes').update(
            { _id: ObjectId(k) },
            {
                name: req.body.name,
                year: req.body.year,
                age: req.body.age,
                quote:req.body.quote,
             },
            { upsert: true }
        )
            res.redirect('/');
        });
    });

app.get('/delete/:id', function(req, res) {
    var k = req.params.id;
    MongoClient.connect(url, function(err, db) {
        try {
            console.log("inside try");
            db.collection('quotes').deleteOne( { _id : ObjectId(req.params.id)}  );
            res.redirect('/');
        } catch (e) {
            print(e);
        }
    });
});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});






// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;