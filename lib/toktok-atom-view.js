var config = require('../config.json');
var util = require('util');
var opentok = require('./public/js/opentok-client-2.4.1.min');
// var opentok = require('./public/js/TB');
var Frame = require('./frame.js');
var STATIC = 'http://www.tokbox.com/blog/wp-content/uploads/2014/08/LogoOpenTok.png';
var $ = atom.$;
var workspace = atom.workspace;

var TokTokView = function(state, sessionId, token, serverUrl) {
  var self = this;
  self.count = (typeof state == 'undefined') ? 0 : state.count;
  self.session = OT.initSession(config.apiKey, sessionId);
  self.prevState = state;
  self.serverUrl = serverUrl;
  var defHeight, defWidth = '250px';
  self.subscribers = {};
  self.publisher = undefined;
  self.myStream = undefined;
  self.connectionCount = 0;
  var streamsDiv = document.createElement('div');
  streamsDiv.id = 'streams';
  self.panel = atom.workspace.addRightPanel({
    item: streamsDiv,
    visible: false
  });
  self.publisherFrame = new Frame(defHeight, defWidth, serverUrl, self.panel);

  self.session.connect(token, function(error) {
    self.publisher = OT.initPublisher('publisher', {
      width: '250px',
      height: '250px'
    });
    self.publisher.on('streamDestroyed', function() {
      self.publisher = undefined;
      self.mystream = undefined;
    });
    self.session.publish(self.publisher, function(err) {
      if (err) throw err;
      self.stream = self.publisher.stream;
    });
  });
  self.toggle();
  self.count += 1; //for analytics purpouses :)
};

TokTokView.prototype = {

  serialize: function() {
    return {
      count: this.count
    };
  },

  destroy: function() {
    this.panel.destroy();
    this.element.remove();
  },

  hide: function() {
    // this.publisherFrame.setAttribute('src', STATIC);
    this.panel.hide();
  },

  show: function() {
    this.panel.show();
    // var pub = this.publisherFrame;
    var u = this.url;
    var state = this.prevState || {};
    var c = state.count || 0;

    function redirect(delay) {
        setTimeout(function() {
          // pub.setAttribute('src', u);
        }, delay);
      }
      //hacky wait til node server is booted up
    c == this.count ? redirect(2000) : redirect(0);
  },

  toggle: function() {
    this.panel.isVisible() ? this.hide() : this.show();
  }
};

/** anonymous prototype export */
module.exports = TokTokView;
