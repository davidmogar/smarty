var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');

var i18n            = require('i18n-2');
var mongoose        = require('mongoose');
var passport        = require('passport');
var session         = require('express-session');
var flash           = require('connect-flash');

/* Config */
var dbConfig        = require('./config/database.js');
var passportConfig  = require('./config/passport');

/* Routes */
var authRoutes      = require('./routes/auth');
var indexRoutes     = require('./routes/index');
var userRoutes      = require('./routes/users');
var questionsRoutes = require('./routes/questions');

var app = express();

/* Connect with mongo database */
mongoose.connect(dbConfig.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error: '));

/* View engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Required by passport */
app.use(session({
    secret: 'ilovescotchscothchyscotchscotch',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* Internationalization */
i18n.expressBind(app, {
  locales: ['en', 'es'],
  defaultLocale: 'es',
  cookieName: 'locale'
});

app.use(function(req, res, next) {
  req.i18n.setLocaleFromQuery();
  req.i18n.setLocaleFromCookie();
  next();
});

app.use('/', authRoutes);
app.use('/', indexRoutes);
app.use('/', questionsRoutes);
app.use('/users', userRoutes);

/* Catch 404 and forward to error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/* Error handlers */

/* Development error handler (will print stacktrace) */
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/* Production error handler (no stacktraces leaked to user) */
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
