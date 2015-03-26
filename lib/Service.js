var Service = module.exports;
var config = require('../config.json');
var opentok = new(require('opentok'))(config.apiKey, config.apiSecret);

var messagingSessionId = config.sessionId;
var messagingToken = opentok.generateToken(messagingSessionId);

var videoSessionId;

function initService(state, callback) {

  function init(videoSessionId) {
    var videoToken = opentok.generateToken(videoSessionId, {
      role: 'moderator' });
    callback(videoSessionId);
  };

  if (typeof state == 'undefined' || !state.hasOwnProperty('session')) {
    console.log('Initializing fresh TokTok instance');
    opentok.createSession(function(err, session) {
      if (err) throw err;
      videoSessionId = session.sessionId;
      console.log('Succesfully created new session');
      init(videoSessionId);
    });
  } else {
    console.log('Initializing TokTok from state');
    init(state.session);
  }
};

Service.initService = initService;

Service.generateToken = function() {
  var token = opentok.generateToken(videoSessionId);
  console.log('Service generated new token ' + token);
  return token;
}

Service.serialize = function() {
  return {
    session: videoSessionId
  };
};

Service.destroy = function() {};
