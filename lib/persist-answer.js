const db = require('./db-store');

const CONSTANTS = require('./_constants');

function _persistAnswerMockedUp (answer) {
  return new Promise(function(resolve, reject) {
    console.log('_persistAnswerMockedUp => ', answer);
    db.update(CONSTANTS.ANSWERS_COLLECTION_NAME, answer, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err})
      } else {
        resolve(data);
      }
    }, false);
  });
}

function _persistAnswer(answer) {
  return new Promise(function(resolve, reject) {
    var path = '/answers';
    console.log('path: ' + path);

    $fh.service({
      "guid" : CONSTANTS.ANSWERS_SERVICE_GUID, // The 24 character unique id of the service
      "path": path, //the path part of the url excluding the hostname - this will be added automatically
      "method": "POST",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
      "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
      "params": answer,
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

function persistAnswer(answer) {
  console.log('ANSWERS_SERVICE_MOCKED_UP', CONSTANTS.ANSWERS_SERVICE_MOCKED_UP);
  if (CONSTANTS.ANSWERS_SERVICE_MOCKED_UP === 'true') {
    console.log('_persistAnswerMockedUp');
    return _persistAnswerMockedUp(answer);
  } else {
    console.log('_persistAnswer');
    return _persistAnswer(answer);
  }
}

module.exports = persistAnswer;