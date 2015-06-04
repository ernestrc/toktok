var TokTokView = require('./TokTokView');
var Service = require('./Service');
var ToktokService = require('./__Service');
var ModalInput = require('./ModalInput');
var $ = require('atom').$;
var plugin = module.exports;
var bluebird = require('bluebird');
var request = bluebird.promisifyAll(require('request'));
var _ = require('underscore');
var view, service, user, modal;

// TODO implement clean interface for messaging and login so that
//we can swap providers

/**
 * Called when package is initialized
 * @param {obj} state
 */
plugin.activate = function (state) {
  console.log('Activating TokTok plugin with state:');
  console.log(state);


  var ser = new ToktokService({}, 'https://api.toktok.io/v1', request);

  ser.activateUser('55577d58e4b00db3afe029fb').then(function (data) {
    if (data.success === true) {
      console.log('YAY!');
    } else {
      console.log(data);
    }
  });

  atom.commands.add('atom-workspace', 'toktok:toggle', toggle);

  function activateWithUser(usr) {
    user = usr;
    !_.isUndefined(modal) ? modal = modal.destroy() : undefined;
    service = new Service(state.service, user,
      function (sessionId, initToken, servizio) {
        view = new TokTokView(state.view, user, sessionId, initToken, servizio);
        console.log('TokTok has been activated ' + view.count + ' times');
        view.toggle();
      });
  }
  if (_.isUndefined(state.user)) {
    var placeholder = 'Select your alias...';
    var buttonMsg = 'Get started';
    modal = new ModalInput(/^[a-zA-Z0-9_]{1,15}$/,
      placeholder, buttonMsg, activateWithUser, true);
  } else activateWithUser(state.user);

  toggle();

};


/**
 * To save state of current window before shutting down.
 * Data is passed to activate() next time we initialize package
 * @return {obj}
 */
plugin.serialize = function () {
  return {
    user: user,
    view: view.serialize(),
    service: service.serialize()
  };
};

/**
 * Release external resources
 */
plugin.deactivate = function () {
  view.destroy();
  service.destroy();
};


var toggle = function () {
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
