'use strict';
var TokTokView = require('./toktok-atom-view');
var server = require('./server');
var plugin = module.exports;

var view, server, modalPanel;

/**
  Called when package is initialized
  @param {obj} state
*/
plugin.activate = function(state) {
  console.log('Activating TokTok...');
  server.createServer(state.server, function(url, session) {
    view = new TokTokView(url, state.view, session);
    modalPanel = atom.workspace.addRightPanel({
      item: view.getElement(),
      visible: false
    });
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
  modalPanel.destroy();
  view.destroy();
  server.destroy();
};


var toggle = function() {
  console.log('TokTok has been toggled ' + view.count + ' times');
  if (modalPanel.isVisible()) {
    view.exit();
    modalPanel.hide();
  } else {
    view.enter();
    modalPanel.show();
  }
};

/** Exposed as command (toktok:toggle) */
plugin.toggle = toggle;
