'use strict';
var TokTokView = require('./toktok-atom-view');
var Server = require('./server');
var plugin = module.exports;

var view;

/**
  Called when package is initialized
  @param {obj} state
*/
plugin.activate = function(state) {
  console.log('Activating TokTok...');
  Server.createServer(state.server, function(url, sessionId) {
    var token = Server.generateToken();
    view = new TokTokView(state.view, sessionId, token, url);
    atom.commands.add('atom-workspace', 'toktok:toggle', toggle);
  });
};


/**
  To save state of current window before shutting down.
  Data is passed to activate() next time we initialize package
  @return {obj}
*/
plugin.serialize = function() {
  return {
    view: view.serialize(),
    server: server.serialize(),
  };
};

/** Release external resources */
plugin.deactivate = function() {
  view.destroy();
  server.destroy();
};


var toggle = function() {
  console.log('TokTok has been toggled ' + view.count + ' times');
  view.toggle();
};

/** Exposed as command (toktok:toggle) */
plugin.toggle = toggle;
