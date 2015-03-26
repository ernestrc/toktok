'use strict';
var TokTokView = require('./TokTokView');
var Service = require('./Service');
var plugin = module.exports;

var view;

/**
  Called when package is initialized
  @param {obj} state
*/
plugin.activate = function(state) {

  Service.initService(state.service, function(sessionId) {
    var token = Service.generateToken();
    view = new TokTokView(state.view, sessionId, token);
    console.log('TokTok has been activated ' + view.count + ' times');
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
    service: Service.serialize(),
  };
};

/** Release external resources */
plugin.deactivate = function() {
  view.destroy();
  Service.destroy();
};


var toggle = function() {
  view.toggle();
};

/** Exposed as command (toktok:toggle) */
plugin.toggle = toggle;
