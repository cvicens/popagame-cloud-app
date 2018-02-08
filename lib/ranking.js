var $fh = require('fh-mbaas-api');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var db = require('./db-store');

var RANKING_SERVICE_GUID = process.env.RANKING_SERVICE_GUID;
var RANKING_COLLECTION_NAME = process.env.RANKING_COLLECTION_NAME || "popagame-ranking";
var RANKING_SERVICE_MOCKED_UP = process.env.RANKING_SERVICE_MOCKED_UP || "true";

function _searchRankingRowsMockedUp (filter) {
  return new Promise(function(resolve, reject) {
    db.list(RANKING_COLLECTION_NAME, filter, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err});
      } else {
        resolve(data);
      }
    });
  });
}

function _searchRankingRows(filter) {
  return new Promise(function(resolve, reject) {
    var path = '/ranking';
    console.log('path: ' + path);

    $fh.service({
      "guid" : RANKING_SERVICE_GUID, // The 24 character unique id of the service
      "path": path, //the path part of the url excluding the hostname - this will be added automatically
      "method": "POST",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
      "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
      "params": filter,
      //"headers" : {
        // Custom headers to add to the request. These will be appended to the default headers.
      //}
    }, function(err, body, response) {
      console.log('statuscode: ', response && response.statusCode);
      if (err) {
        // An error occurred during the call to the service. log some debugging information
        console.log(path + ' service call failed - err : ', err);
        reject({result:'ERROR', msg: err});
      } else {
        resolve(body);
      }
    });
  });
}

function searchRankingRows(filter) {
  console.log('RANKING_SERVICE_MOCKED_UP', RANKING_SERVICE_MOCKED_UP);
  if (RANKING_SERVICE_MOCKED_UP === 'true') {
    console.log('_searchRankingRowsMockedUp');
    return _searchRankingRowsMockedUp(filter);
  } else {
    console.log('_searchRankingRows');
    return _searchRankingRows(filter);
  }
}

function route() {
  var router = new express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.get('/:eventId', function(req, res) {
    var eventId = req.params.eventId;
    console.log('Fetch ranking by eventId ', eventId);
    if (typeof eventId === 'undefined' || eventId == '') {
      res.status(400).json([]);
    }
    /**
     * Fetch ranking data by eventId
     */
    var now = new Date();
    var isoDate = now.getFullYear() + "-" + ('0' + (now.getMonth() + 1)).slice(-2) + "-" + ('0' + now.getDate()).slice(-2);
    console.log('events.list dates >>>> ',isoDate);
    var filter = {
      "eq": {
        "eventId": eventId
      }
    };
    searchRankingRows(filter).
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
