const $fh = require('fh-mbaas-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const searchEvents = require('./search-events');
const getQuizStatusById = require('./get-quiz-status');
const logQuizStatusById = require('./log-quiz-status');

function route() {
  var router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.get('/status/:eventId/:username?', function(req, res) {
    var eventId = req.params.eventId;
    var username = req.params.username;
    console.log('Find event stats by id', eventId, username);
    if (typeof eventId === 'undefined' || eventId == '') {
      res.status(400).json([]);
    }
    
    getQuizStatusById(eventId, username).
    then(function (data) {
      res.status(200).json({ok: true, data: data});
    })
    .catch(function (err) {
      res.status(500).json({ok: false, msg: err})
    });
  });

  router.post('/status/:eventId/:username', function(req, res) {
    var eventId = req.params.eventId;
    var username = req.params.username;
    var status = req.body.status;
    console.log('Find event stats by id', eventId, username);
    if (typeof eventId === 'undefined' || eventId == '' ||
        typeof username === 'undefined' || username == '' ||
        typeof status === 'undefined' || status == '') {
      res.status(400).json([]);
    }
    
    logQuizStatusById(eventId, username, status).
    then(function (data) {
      res.status(200).json({ok: true, data: data});
    })
    .catch(function (err) {
      res.status(500).json({ok: false, msg: err})
    });
  });
  
  return router;
}

module.exports = route;
