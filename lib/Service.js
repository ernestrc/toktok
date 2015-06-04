var config = require('../config.json');
var opentok = new(require('opentok'))(config.apiKey, config.apiSecret);
require('./public/js/opentok-client-2.4.1.min');

function logSignalError(error) {
  if (error) console.log('Signaling Error: ' + error.reason);
}

function Service(state, user, callback) {
  var self = this;
  self.messagingToken = opentok.generateToken(config.sessionId);
  self.signalSession = OT.initSession(config.apiKey, config.sessionId);
  self.signal = self.signalSession.signal;
  self.user = user;

  self.signalSession.on({
    signal: function(signal) {
      var signalData = JSON.parse(signal.data);
      switch (signal.type) {
        case 'signal:init':
          console.log(signalData);
          break;
        case 'signal:usersearch':
          if (signalData.username == self.user) {
            self.signalSession.signal({
              type: 'founduser',
              data: JSON.stringify({
                username: self.user,
                homeSession: self.sessionId
              })
            }, logSignalError);
          }
          break;
      }
    }
  });

  self.signalSession.connect(self.messagingToken, function() {
    self.signalSession.signal({
      type: 'init',
      data: JSON.stringify({
        message: 'Hello World'
      })
    }, function(error) {
      if (error) console.log('Signaling Error: ' + error.reason);
    });
  });


  self.sessionId = undefined;

  function init(sessionId) {
    console.log('Initializing service with sessionId: ' + sessionId);
    var token = opentok.generateToken(sessionId);
    callback(sessionId, token, self);
  };

  if (typeof state == 'undefined' || !state.hasOwnProperty('sessionId')) {
    console.log('Initializing fresh TokTok Service instance');
    opentok.createSession(function(err, session) {
      if (err) throw err;
      console.log('Succesfully created new session');
      self.sessionId = session.sessionId;
      init(self.sessionId);
    });
  } else {
    self.sessionId = state.sessionId;
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
 * Search user by username
 * @param {func} handler
 * @return {funct} to emulate curried function
 */
Service.prototype.searchUser = function(handler) {
  var self = this;
  return function(username) {
    self.signalSession.signal({
      type: 'usersearch',
      data: JSON.stringify({
        username: username
      })
    }, logSignalError);
    self.signalSession.on({
      'signal': function(signal) {
        handler(signal)(username);
      }
    });
  };
};

/**
 * Cancel user search, remove event handler.
 * @param {func} handler
 * @return {funct} function to be applied by input controller
 */
Service.prototype.cancelSearchUser = function(handler) {
  return function(username) {
    self.signalSession.off('signal', handler);
  };
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
