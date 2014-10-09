var express   = require('express');
var events    = require('events');
var router    = express.Router();

var Question  = require('../models/question');
var Tag       = require('../models/tag');

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    message: 'Smarty'
  });
});

router.get('/questions', isLoggedIn, function(req, res) {
  Question.findRandom().limit(req.query.questions).exec(function (err, questions) {
    res.render('questions', {
      title: 'Smarty',
      user: req.user,
      questions: questions
    });
  });
})

router.post('/questions', isLoggedIn, function(req, res) {
  var question = new Question();
  var questionSaver = function(err) {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/questions');
    }
  };

  question.text = req.body.text;
  question.type = req.body.type;
  question.language = req.body.lang;

  var tags = req.body.tags.split(",");
  var tagsSaved = 0;

  /* Save the question only if all the tags were saved. */
  var eventEmitter = new events.EventEmitter();
  eventEmitter.on('tagSaved', function() {
    tagsSaved++;

    if (tagsSaved === tags.length) {
      question.save(questionSaver);
    }
  });

  if (tags.length > 0) {

    var saveTag = function(tags, current, total) {
      Tag.find({ name: tags[i] }, function(err, questionTag) {
        if (err) {
          res.send(err);
        } else {
          if (questionTag.length) {
            question.meta.tags.push(questionTag[0]);
            eventEmitter.emit('tagSaved');

            current++;

            if (current < total) {
              saveTag(tags, current, total);
            }
          } else {
            questionTag = new Tag({ name: tags[current] });
            questionTag.save(function(err) {
              question.meta.tags.push(questionTag);
              eventEmitter.emit('tagSaved');

              current++;

              if (current < total) {
                saveTag(tags, current, total);
              }
            });
          }
        }
      });
    }

    /* Save all tag references */
    for (i = 0; i < tags.length; i++) {
      saveTag(tags, 0, tags.length);
    }
  } else {
    question.save(questionSaver);
  }
});

router.get('/questions/:question_id', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      res.render('question', {
        title: 'Smarty',
        user: req.user,
        question: question,
        answers: question.answers
      });
    }
  });
});

router.get('/questions/:question_id/delete', isLoggedIn, function(req, res) {
  Question.remove({ _id: req.params.question_id }, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/questions');
    }
  });
});

router.post('/questions/:question_id/edit', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      question.text = req.body.text;
      question.type = req.body.type;
      question.language = req.body.lang;

      question.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/questions');
        }
      });
    }
  });
});

router.get('/questions/:question_id/favorite', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      question.meta.favs++;

      question.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/questions');
        }
      });
    }
  });
});

router.get('/questions/:question_id/votedown', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      question.meta.votes--;

      question.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/questions');
        }
      });
    }
  });
});

router.get('/questions/:question_id/voteup', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      question.meta.votes++;

      question.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/questions');
        }
      });
    }
  });
});

router.post('/questions/:question_id/answer', isLoggedIn, function(req, res) {
  Question.findById(req.params.question_id, function(err, question) {
    if (err) {
      res.send(err);
    } else {
      question.answers.push({ text: req.body.text, score: req.body.score });

      question.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/questions/' + req.params.question_id);
        }
      });
    }
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}
