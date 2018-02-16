var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var session = require('express-session');

var db = require('./model/db');

var index = require('./routes/index');
var users = require('./routes/users');
var common = require('./routes/common');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 10 MiB limit for gpx file
app.use(busboy({
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})); 

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: require('crypto').randomBytes(64).toString('hex')
}))

app.use(express.static(path.join(__dirname, 'public')));

// insert upload path
app.use(function(req, res, next) {
    req.session.uploadPath = __dirname + '/files/';
    next();
});

app.use('/', index);
app.use('/users', users);

app.get('/upload', common.upload);
app.get('/parsegpx', common.parsegpx);
app.post('/fileupload', common.fileupload);









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
