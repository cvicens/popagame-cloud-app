const $fh = require('fh-mbaas-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const searchEvents = require('./search-events');

function route() {
  var router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.get('/', function(req, res) {
    var id = req.query.id;
    console.log('id ' + id);
    if (typeof id === 'undefined' || id === '') {
      res.status(404).json([]);
      return;
    }
    db.read(EVENTS_COLLECTION_NAME, id, function (err, data) {
      if (err) {
        res.status(500).json({result:'ERROR', msg: err})
      } else {
        res.status(200).json({ok: true, data: data});
      }
    });
  });

  router.post('/', function(req, res) {
    var filter = req.body;
    console.log('filter: ' + filter);
    if (typeof filter === 'undefined') {
      res.status(404).json([]);
      return;
    }

    searchEvents(filter).
    then(function (data) {
      res.status(200).json({ok: true, data: data});
    })
    .catch(function (err) {
      res.status(500).json({result:'ERROR', msg: err})
    });
  });

  router.get('/:country/:city', function(req, res) {
    var country = req.params.country;
    var city = req.params.city;
    console.log('Find event by country', country, 'city', city);
    if (typeof country === 'undefined' || country == '' ||
        typeof city === 'undefined' || city == '') {
      res.status(400).json([]);
    }
    /**
     * Finding an event by country, city, ...
     */
    var now = new Date();
    var isoDate = now.getFullYear() + "-" + ('0' + (now.getMonth() + 1)).slice(-2) + "-" + ('0' + now.getDate()).slice(-2);
    console.log('events.list dates >>>> ',isoDate);
    var filter = {
      "eq": {
        "country": country.toUpperCase(),
        "city": city.toUpperCase(),
        "date": isoDate
      }
    };
    searchEvents(filter).
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
