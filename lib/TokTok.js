'use strict';
var TokTokView = require('./TokTokView');
var Service = require('./Service');
var plugin = module.exports;
var view, service;

// TODO implement clean interface for messaging and login so that
//we can swap providers

/**
 * Called when package is initialized
 * @param {obj} state
 */
plugin.activate = function(state) {
  console.log('Activating TokTok plugin with state:');
  console.log(state);
  service = new Service(state.service, function(sessionId, initToken) {
    view = new TokTokView(state.view, sessionId, initToken);
    console.log('TokTok has been activated ' + view.count + ' times');
    atom.commands.add('atom-workspace', 'toktok:toggle', toggle);
  });
};


/**
 * To save state of current window before shutting down.
 * Data is passed to activate() next time we initialize package
 * @return {obj}
 */
plugin.serialize = function() {
  return {
    view: view.serialize(),
    service: service.serialize()
  };
};

/**
 * Release external resources
 */
plugin.deactivate = function() {
  view.destroy();
  service.destroy();
};


var toggle = function() {
  view.toggle();
};

/**
 * Exposed as command (toktok:toggle)
 */
plugin.toggle = toggle;
