var express   = require('express');
var events    = require('events');
var xml       = require('xml');
var router    = express.Router();

var Exam      = require('../models/exam');
var Question  = require('../models/question');
var Tag       = require('../models/tag');
var User      = require('../models/user');

/* GET profile page */
router.get('/profile', isLoggedIn, function(req, res) {
  Exam.find(function(err, exams) {
    res.set('Content-Type', 'text/html');
    res.render('profile', {
      title: 'Smarty ser profile',
      user: req.user,
      exams: exams,
      i18n: req.i18n
    });
  });
});

/**
 * GET exam
 *
 * Params:
 * - lang
 * - questions
 * - format
 */
router.get('/exam', function(req, res) {
  var tagsIds = [];
  var tagsProcessed = 0;
  var lang = (req.query.lang == undefined)? 'en' : req.query.lang;

  var eventEmitter = new events.EventEmitter();
  eventEmitter.on('tagProcessed', function() {
    tagsProcessed++;

    if (req.query.tags == undefined || tagsProcessed >= tags.length) {
      if (tagsIds.length > 0) {
        var filter = { language: lang, 'meta.tags': { $in: tagsIds } };
      } else {
        var filter = { language: lang };
      }

      switch (req.query.format) {
        case "json":
          Question.findRandom(filter).limit(req.query.questions).exec(function (err, questions) {
            if (err) {
              res.send(err);
            } else {
              res.set('Content-Type', 'text/json');
              res.json(questions);
            }
          });
          break;
        case "xml":
          Question.findRandom(filter).limit(req.query.questions).exec(function (err, questions) {
            if (err) { res.send(err); }

            var exam = xml({
              exam: questions.map(function(question) {
                return {
                  question: [
                    { _attr: { type: question.type } },
                    { text: question.text },
                    { language: question.language },
                    { answers: question.answers.map(function(answer) {
                        return {
                          answer: [
                            { text: answer.text },
                            { score: answer.score }
                          ]
                        }
                      })
                    },
                    { meta: [
                        { favs: question.meta.favs },
                        { votes: question.meta.votes },
                      ]
                    }
                  ]
                }
              })
            });

            res.set('Content-Type', 'text/xml');
            res.send(exam);
          });
          break;
        case "html":
        default:
          if (req.isAuthenticated()) {
            Question.findRandom(filter).limit(req.query.questions).exec(function (err, questions) {
              if (err) {
                res.send(err);
              } else {
                res.set('Content-Type', 'text/html');
                res.render('exam', {
                  title: 'Smarty',
                  user: req.user,
                  questions: questions,

                });
              }
            });
          } else {
            res.redirect('/');
          }
      }
    }
  });

  if (req.query.tags != undefined) {
    var tags = req.query.tags.split(",");

    if (tags.length > 0) {

      for (var i = 0; i < tags.length; i++) {
        Tag.find({name: tags[i]}, function(err, tag) {
          if (err) {
            res.send(err);
          } else {
            if (tag[0] != undefined) {
              tagsIds.push(tag[0]._id);
            }
          }
          eventEmitter.emit('tagProcessed');
        });
      }
    } else {
      eventEmitter.emit('tagProcessed');
    }
  } else {
    eventEmitter.emit('tagProcessed');
  }
});

/* POST exam */
router.post('/exam', function(req, res) {
  var answers = Object.keys(req.body).length;
  var answersChecked = 0;
  var score = 0;

  /* Create new exam to store results */
  var exam = new Exam();

  var eventEmitter = new events.EventEmitter();
  eventEmitter.on('answerChecked', function() {
    answersChecked++;

    if (answersChecked === answers) {
      exam.score = score;
      User.findById(req.user, function(err, user) {
          exam.user = user;

          exam.save(function(err) {
            if (err) {
              res.send(err);
            } else {
              res.redirect('/users/profile');
            }
          });
      });
    }
  });

  for (var question_id in req.body) {
    Question.findById(question_id, function(err, question) {
      if (err) {
        res.send(err);
      } else {
        /* Save question */
        exam.questions.push(question);

        /* Get score */
        switch(question.type) {
          case 'multichoice':
            for (i = 0; i < question.answers.length; i++) {
              if (question.answers[i]._id == req.body[question._id]) {
                score += question.answers[i].score;
                break;
              }
            }
            break;
          case 'truefalse':
            for (i = 0; i < question.answers.length; i++) {
              if (question.answers[i].text.toLowerCase() == req.body[question._id]) {
                score += question.answers[i].score;
                break;
              }
            }
            break;
          case 'numerical':
            for (i = 0; i < question.answers.length; i++) {
              if (question.answers[i].text == req.body[question._id]) {
                score += question.answers[i].score;
                break;
              }
            }
            break;
        }
      }

      eventEmitter.emit('answerChecked');
    });
  }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}
