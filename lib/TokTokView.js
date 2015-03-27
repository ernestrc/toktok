var config = require('../config.json');
var util = require('util');
var opentok = require('./public/js/opentok-client-2.4.1.min');
var Frame = require('./Frame.js');
var $ = atom.$;
var workspace = atom.workspace;

var TokTokView = function(state, sessionId, token) {
  console.log('Creating new TokTokView with sessionId' +
    sessionId + 'and token ' + token);
  var self = this;
  self.state = state;
  self.count = (typeof state == 'undefined') ? 0 : state.count;
  self.session = OT.initSession(config.apiKey, sessionId);
  self.token = token;
  self.initSize = '250px';
  self.publisher = undefined;
  self.subscribers = {};
  self.connectionCount = 0;

  var streamsDiv = document.createElement('div');
  streamsDiv.id = 'streams';

  self.panel = atom.workspace.addRightPanel({
    item: streamsDiv,
    visible: false
  });

  self.frames = {};
  self.init();
  self.toggle();
  self.count += 1; //for analytics purpouses :)
};

TokTokView.prototype = {
  constructor: TokTokView,

  init: function() {
    var self = this;
    var initSize = self.initSize;
    self.session.connect(self.token, function(error) {
      if (error) console.log(error);

      self.publisherFrame = new Frame('publisher',
        self.initSize, self.initSize, self.panel);

      self.publisher = OT.initPublisher(self.publisherFrame.id, {
        width: initSize,
        height: initSize
      });

      self.frames[self.publisherFrame.id] = self.publisherFrame;

      self.session.publish(self.publisherFrame.publisher, function(err) {
        if (err) throw err;
        console.log('Succesfully published stream to session');
      });
    });

    self.session.on({

      'signal': function(signal) {
        var signalData = JSON.parse(signal.data);
        switch (signal.type) {
          case 'signal:init':
            console.log(signalData);
            break;
        }
      },

      'streamCreated': function(event) {
        console.log('A new stream was created!');
        var conn = event.stream.connection.connectionId;
        var id = 'conn-' + conn;
        var frame = new Frame(id, self.initSize, self.initSize, self.panel);
        self.frames[frame.id] = frame;

        self.subscribers[id] = self.session.subscribe(
          event.stream, id, {
            width: self.initSize,
            height: self.initSize
          });

        self.subscribers[id].on('destroyed', function(event) {
          delete self.subscribers[conn];
        });

        self.layout();
      },

      'streamDestroyed': function(event) {
        var conn = event.stream.connection.connectionId;
        var id = 'conn-' + conn;
        self.frames[id].destroy();
        delete self.frames[id];
        self.layout();
      },

      'connectionCreated': function(event) {
        self.connectionCount++;
        if (event.connection.connectionId !=
          self.session.connection.connectionId) {
          console.log('Another client connected. ' +
            self.connectionCount + ' total.');
        }
      },

      'connectionDestroyed': function(event) {
        self.connectionCount--;
        console.log('A client disconnected. ' +
          self.connectionCount + ' total.');
      }

    });
    self.layout();
    console.log('Successfully initialized TokTok view');
    console.log(self);
  },

  layout: function() {
    var n = Object.keys(this.frames).length - 1;
    var red = 40;
    var newSize = (250 - red * n).toString() + 'px';
    console.log('Changing layout to ' + newSize);
    for (var id in this.frames) {
      this.frames[id].layout(newSize, newSize);
    }
  },

  serialize: function() {
    return {
      count: this.count
    };
  },

  destroy: function() {
    this.session.disconnect();
    for (var id in this.frames) {
      this.frames[id].destroy();
      delete this.frames[id];
    }
    this.panel.destroy();
  },

  hide: function() {
    this.panel.hide();
  },

  show: function() {
    this.panel.show();
  },

  toggle: function() {
    this.panel.isVisible() ? this.hide() : this.show();
  }
};

/** anonymous prototype export */
module.exports = TokTokView;
