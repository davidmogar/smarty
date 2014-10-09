var express = require('express');
var flash = require('connect-flash');
var passport = require('passport');
var router = express.Router();

/* GET login form. */
router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Smarty login',
    message: req.flash('loginMessage')
  });
});

/* GET signup form */
router.get('/signup', function(req, res) {
  res.render('signup', {
    title: 'Smarty sign up',
    message: req.flash('signupMessage')
  });
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

/* POST login form */
router.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}));

/* POST signup form */
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/',
	failureRedirect : '/signup',
	failureFlash : true
}));

module.exports = router;
