var config = require('../config.json');
var opentok = new(require('opentok'))(config.apiKey, config.apiSecret);

function Service(state, callback) {
  this.messagingSessionId = config.sessionId;
  this.messagingToken = opentok.generateToken(this.messagingSessionId);
  this.sessionId = undefined;

  function init(sessionId) {
    console.log('Initializing service with sessionId: ' + sessionId);
    var token = opentok.generateToken(sessionId);
    callback(sessionId, token);
  };

  if (typeof state == 'undefined' || !state.hasOwnProperty('sessionId')) {
    console.log('Initializing fresh TokTok Service instance');
    var self = this;
    opentok.createSession(function(err, session) {
      if (err) throw err;
      console.log('Succesfully created new session');
      self.sessionId = session.sessionId;
      init(self.sessionId);
    });
  } else {
    this.sessionId = state.sessionId;
    console.log('Initializing TokTok from state');
    init(this.sessionId);
  }

  console.assert(typeof this.sessionId != 'undefined',
    'Did not initialized session correctly');
}

/**
 * @return {obj}
 */
Service.prototype.generateToken = function() {
  var token = opentok.generateToken(this.sessionId);
  console.log('Service generated new token ' + token);
  return token;
};

/**
 * @return {String} sessionId
 */
Service.prototype.serialize = function() {
  return {
    sessionId: this.sessionId
  };
};

/**
 *
 */
Service.prototype.destroy = function() {};

/**
 * Anonymous prototype export
 */
module.exports = Service;
