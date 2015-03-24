var STATIC = 'http://www.tokbox.com/blog/wp-content/uploads/2014/08/LogoOpenTok.png';

var opentok = require('./public/js/opentok-client-2.4.1.min');
var config = require('../config.json');
var $ = atom.$;
var workspace = atom.workspace;

var TokTokView = function(url, state, sessionId) {
  this.session = OT.initSession(config.apikey, sessionId);
  this.prevState = state;
  this.url = url;
  this.count = (typeof state == 'undefined') ? 0 : state.count;
  this.subscribers = 0;
  // var videoFrame = document.createElement('div');
  var iframe = document.createElement('iframe');
  // $(videoFrame).append(iframe);
  iframe.classList.add('atom-talk-iframe');
  iframe.frameBorder = 0;
  iframe.width = '250px';
  iframe.height = '250px';
  iframe.id = 'randomid';
  iframe.scrolling = 'no';
  iframe.onload = function() {
    var newHeight = iframe.contentWindow.document.body.scrollHeight + 'px';
    console.log('Resizing iframe to ' + newHeight);
    iframe.setAttribute('height', newHeight);
  };
  iframe.setAttribute('src', STATIC);
  this.panel = atom.workspace.addRightPanel({
    item: iframe,
    visible: false
  });
  this.publisherFrame = iframe;
  this.toggle();
};

/**
 To save state of current view before shutting down.
 @return {obj}
 */
TokTokView.prototype.serialize = function() {
  return {
    count: this.count
  };
};

/**
 To release any resources before shutting down package
 */
TokTokView.prototype.destroy = function() {
  this.panel.destroy();
  this.element.remove();
};

/**
 Hide modal panel
 */
TokTokView.prototype.exit = function() {
  this.publisherFrame.setAttribute('src', STATIC);
  this.panel.hide();
};

/**
 Show modal panel
 */
TokTokView.prototype.enter = function() {
  this.panel.show();
  var pub = this.publisherFrame;
  var u = this.url;
  var state = this.prevState || {};
  var c = state.count || 0;

  function redirect(delay) {
      setTimeout(function() {
        pub.setAttribute('src', u);
      }, delay);
    }
    //hacky wait til node server is booted up
  c == this.count ? redirect(2000) : redirect(0);
  this.count += 1;
};

/**
  Toggle show/hide
*/
TokTokView.prototype.toggle = function() {
  this.panel.isVisible() ? this.exit() : this.enter();
};


/** Anonymous prototype export */
module.exports = TokTokView;
