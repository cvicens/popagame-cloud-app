const $fh = require('fh-mbaas-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const assert = require('assert');

const searchEventById = require('./search-event-by-id');

const persistAnswer = require('./persist-answer');
const searchAnswers = require('./search-answers');

function getFormattedTime(date) {
  return ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes()+1)).slice(-2);
}

function getFormattedDate(date) {
  //return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear();
  return  date.getFullYear() + ('0' + (date.getMonth()+1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}

function route() {
  var router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.post('/', function(req, res) {
    let answer = req.body;
    console.log('answer received:', JSON.stringify(answer));
    if (typeof answer.username === 'undefined' || 
        typeof answer.eventId === 'undefined' ||
        typeof answer.questionIdx === 'undefined' ||
        typeof answer.answer === 'undefined') {
      res.status(404).json([]);
      return;
    }

    // Let's add a timestamp
    //answer.timestamp = (new Date()).toISOString(); 
    
    // Let's add a date so that we can only have 1 record per question, username and date
    answer.date = getFormattedDate(new Date);
    
    var filter = {
      eq: {
        username: answer.username,
        eventId: answer.eventId,
        questionIdx: answer.questionIdx
      }
    }
    searchAnswers(filter)
    .then((data) => {
      if (typeof data != 'undefined' && data.constructor === Array) {
        if (data.length <= 0) {
          // Answer is not registered yet, so look for the event re. to the answer
          return searchEventById(answer.eventId);    
        }
        else {
          throw 'Duplicated answer';
        }
      }
      else {
        throw 'Uknown error';
      }
    })
    .then((event) => {
      //console.log('searchEventById => event', JSON.stringify(event));
      if (typeof event != 'undefined' && typeof event.quiz != 'undefined' && typeof event.quiz.questions != 'undefined') {
        return event.quiz.questions[answer.questionIdx];
      } else {
        throw {msg: 'Event data corrupted or incomplete', payload: event};
      }
    })
    .then(function (question) {
      if (typeof question === 'undefined') {
        throw 'No question found, no answer registered';
      }
      assert(typeof question.answers != 'undefined' && question.answers.constructor === Array);
      //console.log('searchEventById => question', JSON.stringify(question));
      // TODO: compare arrays! Not just [0] !
      answer.result = answer.answer == question.answers[0] ? 'CORRECT' : 'WRONG';
      return persistAnswer(answer);
    })
    .then(function (data) {
      res.status(200).json({ok: true, data: data});
    })
    .catch (function (err) {
      console.error('/answers persistAnswer Error: ', err);
      res.status(500).json({ok: false, msg: err});
      return;
    });
     
  });

  router.post('/search', function(req, res) {
    var filter = req.body;
    console.log('filter: ' + filter);
    if (typeof filter === 'undefined') {
      res.status(404).json([]);
      return;
    }

    searchAnswers(filter).
    then(function (data) {
      res.status(200).json({ok: true, data: data});
    })
    .catch(function (err) {
      res.status(500).json({ok: false, msg: err});
    });
  });

  router.get('/:username/:eventId/:questionIdx', function(req, res) {
    var username = req.params.username;
    var eventId = req.params.eventId;
    var questionIdx = req.params.questionIdx;
    console.log('search answer params', username, eventId, questionIdx);
    if (typeof username === 'undefined' || typeof eventId === 'undefined' || typeof questionIdx === 'undefined') {
      res.status(404).json([]);
      return;
    }

    // Let's gen some answers and persist them
    var filter = {
      eq: {
        username: username,
        eventId: eventId,
        questionIdx: questionIdx
      }
    }
    searchAnswers(filter)
    .then(function (data) {
      //console.log('data', data)
      res.status(200).json({ok: true, data: data});
    })
    .catch (function (err) {
      res.status(500).json({ok: false, msg: err});
      return;
    });
     
  });

  router.get('/delete/:eventId/:quizId/:date', function(req, res) {
    var eventId = req.params.eventId;
    var quizId = req.params.quizId;
    var date = req.params.date;
    console.log('delete params', eventId, quizId, date);
    if (typeof eventId === 'undefined' || typeof quizId === 'undefined' || typeof date === 'undefined') {
      res.status(404).json([]);
      return;
    }

    // Let's gen some answers and persist them
    var filter = {
      eq: {
        eventId: eventId,
        quizId: quizId,
        date: date
      }
    }
    searchAnswers(filter)
    .then(function (results) {
      //console.log('answers to delete', results);
      var deletePromises = [];
      for (var i = 0; i < results.length; i++) {
        deletePromises.push(deleteAnswer(results[i].guid));
      }
      return Promise.all(deletePromises);
    })
    .then(function (data) {
      console.log('data', data)
      res.status(200).json({ok: true, data: data});
    })
    .catch (function (err) {
      res.status(500).json({ok: false, msg: err});
      return;
    });
     
  });

  return router;
}

module.exports = route;
