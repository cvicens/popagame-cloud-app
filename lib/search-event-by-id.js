const db = require('./db-store');

const CONSTANTS = require('./_constants');

function _searchEventByIdMockedUp (eventId) {
  return new Promise(function(resolve, reject) {
    db.read(CONSTANTS.EVENTS_COLLECTION_NAME, eventId, function (err, data) {
      if (err) {
        reject({result:'ERROR', msg: err});
      } else {
        console.log('_searchEventByIdMockedUp data', data);
        resolve(data);
      }
    });
  });
}

function _searchEventById(eventId) {
  return new Promise(function(resolve, reject) {
    var path = '/' + CONSTANTS.EVENTS_COLLECTION_NAME + '/' + eventId;
    console.log('path: ' + path);

    $fh.service({
      "guid" : CONSTANTS.EVENTS_SERVICE_GUID, // The 24 character unique id of the service
      "path": path, //the path part of the url excluding the hostname - this will be added automatically
      "method": "GET",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
      "timeout": 25000, // timeout value specified in milliseconds. Default: 60000 (60s)
      //"params": filter,
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

function searchEventById(eventId) {
  console.log('CONSTANTS.EVENTS_SERVICE_MOCKED_UP', CONSTANTS.EVENTS_SERVICE_MOCKED_UP);
  if (CONSTANTS.EVENTS_SERVICE_MOCKED_UP === 'true') {
    console.log('_searchEventByIdMockedUp');
    return _searchEventByIdMockedUp(eventId);
  } else {
    console.log('_searchEventById');
    return _searchEventById(eventId);
  }
}

module.exports = searchEventById;