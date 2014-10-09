var flash = require('connect-flash');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email': email }, function(err, user) {
        if (err) { return done(err); }
        if (user) {
          return done(null, false, req.flash('signupMessage', 'Someone else is already using that email address.'));
        } else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if (err) { throw err; }
            return done(null, newUser);
          });
        }
      });
    });
}));

passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    User.findOne({ 'local.email' :  email }, function(err, user) {
      if (err) { return done(err); }
      if (!user || !user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'The email or password you entered is incorrect.'));
      }
      return done(null, user);
    });
}));
