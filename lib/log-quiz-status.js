const db = require('./db-store');

const CONSTANTS = require('./_constants');

function _logQuizStatusByIdMockedUp (eventId, username, newStatus) {
  return new Promise(function(resolve, reject) {
    const payload = {eventId, username, newStatus, timestamp: new Date().toISOString()};
    db.update(CONSTANTS.QUIZ_STATUS_COLLECTION_NAME, payload, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err})
      } else {
        resolve(data);
      }
    }, false);
  });
}

function _logQuizStatusById(eventId, username, newStatus) {
  return new Promise(function(resolve, reject) {
    var path = '/quizzes';
    console.log('path: ' + path);

    const payload = {eventId, username, newStatus};

    $fh.service({
      "guid" : CONSTANTS.QUIZ_STATUS_SERVICE_GUID, // The 24 character unique id of the service
      "path": path, //the path part of the url excluding the hostname - this will be added automatically
      "method": "POST",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
      "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
      "params": payload,
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

function logQuizStatusById(eventId, username, newStatus) {
  console.log('CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP', CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP);
  if (CONSTANTS.QUIZ_STATUS_SERVICE_MOCKED_UP === 'true') {
    console.log('_logQuizStatusByIdMockedUp');
    return _logQuizStatusByIdMockedUp(eventId, username, newStatus);
  } else {
    console.log('_logQuizStatusById');
    return _logQuizStatusById(eventId, username, newStatus);
  }
}

module.exports = logQuizStatusById;