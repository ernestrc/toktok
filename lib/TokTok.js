'use strict';
var TokTokView = require('./TokTokView');
var Service = require('./Service');
var ModalInput = require('./ModalInput');
var $ = require('atom').$;
var plugin = module.exports;
var _ = require('underscore');
var view, service, user, modal;

// TODO implement clean interface for messaging and login so that
//we can swap providers

/**
 * Called when package is initialized
 * @param {obj} state
 */
plugin.activate = function(state) {
  console.log('Activating TokTok plugin with state:');
  console.log(state);

  atom.commands.add('atom-workspace', 'toktok:toggle', toggle);

  function activateWithUser(usr) {
    user = usr;
    modal = undefined;
    service = new Service(state.service, function(sessionId, initToken) {
      view = new TokTokView(state.view, user, sessionId, initToken);
      console.log('TokTok has been activated ' + view.count + ' times');
      view.toggle();
    });
  }
  if (_.isUndefined(state.user)) {
    modal = new ModalInput(/^[a-zA-Z0-9_]{1,15}$/, activateWithUser);
  } else activateWithUser(state.user);

};


/**
 * To save state of current window before shutting down.
 * Data is passed to activate() next time we initialize package
 * @return {obj}
 */
plugin.serialize = function() {
  return {
    user: user,
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
  console.log('Toggling TokTok views...');
  if (!_.isUndefined(view)) {
    view.toggle();
  }
  if (!_.isUndefined(modal)) {
    modal.toggle();
  }
};

/**
 * Exposed as command (toktok:toggle)
 */
plugin.toggle = toggle;
