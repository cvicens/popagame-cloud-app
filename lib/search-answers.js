const db = require('./db-store');

const CONSTANTS = require('./_constants');

function _searchAnswersMockedUp (filter) {
  return new Promise(function(resolve, reject) {
    db.list(CONSTANTS.ANSWERS_COLLECTION_NAME, filter, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err});
      } else {
        resolve(data);
      }
    });
  });
}

function _searchAnswers(filter) {
  return new Promise(function(resolve, reject) {
    var path = '/answers';
    console.log('path: ' + path);

    $fh.service({
      "guid" : CONSTANTS.ANSWERS_SERVICE_GUID, // The 24 character unique id of the service
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

function searchAnswers(filter) {
  console.log('ANSWERS_SERVICE_MOCKED_UP', CONSTANTS.ANSWERS_SERVICE_MOCKED_UP);
  if (CONSTANTS.ANSWERS_SERVICE_MOCKED_UP === 'true') {
    console.log('_searchAnswersMockedUp');
    return _searchAnswersMockedUp(filter);
  } else {
    console.log('_searchAnswers');
    return _searchAnswers(filter);
  }
}

module.exports = searchAnswers;