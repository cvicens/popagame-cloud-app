const db = require('./db-store');

const CONSTANTS = require('./_constants');

function _getQuizStatusByIdMockedUp (filter) {
  return new Promise(function(resolve, reject) {
    db.list(CONSTANTS.QUIZ_STATUS_COLLECTION_NAME, filter, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err});
      } else {
        if (typeof data != 'undefined' && data.constructor === Array) {
          resolve(data[0]);
        } else {
          reject({result:'ERROR', msg: 'Answer is not an array'});
        }
      }
    });
  });
}

function _getQuizStatusById(filter) {
  return new Promise(function(resolve, reject) {
    var path = '/events';
    console.log('path: ' + path);

    $fh.service({
      "guid" : CONSTANTS.QUIZ_STATUS_SERVICE_GUID, // The 24 character unique id of the service
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
        if (typeof body != 'undefined' && body.constructor === Array) {
          resolve(body[0]);
        } else {
          reject({result:'ERROR', msg: 'Answer is not an array'});
        }
      }
    });
  });
}

function getQuizStatusById(eventId, username = null) {
  const filter = {
    sort: {
      timestamp: -1 // Sort by the 'timestamp' field ascending a-z
    },
    eq: {
      eventId
    }
  };
  if (username) {
    filter.eq.username = username
  }
  console.log('CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP', CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP);
  if (CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP === 'true') {
    console.log('_getQuizStatusByIdMockedUp');
    return _getQuizStatusByIdMockedUp(filter);
  } else {
    console.log('_getQuizStatusById');
    return _getQuizStatusById(filter);
  }
}

module.exports = getQuizStatusById;