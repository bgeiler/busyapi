var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var memcached = require('memcached');
var cluster = require('cluster');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Counting usages of the API
var usages = 0;
app.usages = usages;

// shared cache version of the in-memory usage store
var cache = new memcached('localhost:11211', {timeout:600000, idle:600000});  //Some nice long timeouts for testing
app.cache = cache;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Set up logger
logger.token("usages", function getUsages() {
  return "Usage count: " + app.usages;
});
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(logger(':usages :method :url :status :response-time ms - :res[content-length]', {stream: accessLogStream}));  //Now using this to record both messages and logging to a file stream.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// API
require('./routes/api/usages')(app);

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
