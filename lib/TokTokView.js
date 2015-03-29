var TokTokView = module.exports;
var config = require('../config.json');
var util = require('util');
var $ = require('atom').$;
var Frame = require('./Frame.js');
require('./public/js/opentok-client-2.4.1.min');

var TokTokView = function(state, user, sessionId, token) {
  console.log('Creating new TokTokView with sessionId' +
    sessionId + 'and token ' + token);
  var self = this;
  self.user = user;
  self.state = state;
  self.count = (typeof state == 'undefined') ? 0 : state.count;
  self.session = OT.initSession(config.apiKey, sessionId);
  self.token = token;
  self.initSize = '250px';
  self.publisher = undefined;
  self.subscribers = {};
  self.connectionCount = 0;
  self.frames = {};

  self.createView();
  self.count += 1; //for analytics purpouses :)

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
      var frame = new Frame(id, self.initSize, self.initSize, self.streams);
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
      console.log('streamDestroyed event received');
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
    },

    'sessionDisconnected': function(event) {
      console.log('Disconnected from current session');
    }
  });
};

TokTokView.prototype = {
  constructor: TokTokView,

  createView: function() {
    var self = this;
    self.view = document.createElement('div');
    self.view.id = 'toktok-view';
    self.streams = document.createElement('div');
    self.streams.id = 'toktok-streams';
    self.chat = document.createElement('div');
    self.chat.id = 'toktok-chat';

    self.panel = atom.workspace.addRightPanel({
      item: self.view,
      visible: false
    });

    var add = $.parseHTML('<div class="btn add-btn">Add friend</div>')[0];
    var conn = $.parseHTML('<div class="btn connect">Connect</div>')[0];
    var share = $.parseHTML('<div class="btn share">Share</div>')[0];

    $('#toktok-view')
      .append(self.streams)
      .append(self.chat)
      .append(conn)
      .append(add)
      .append(share);

    var logoDiv = document.createElement('div');
    logoDiv.classList.add('opentok-logo');

    $('#toktok-streams')
      .css('min-height', '250px')
      .css('min-width', '250px')
      .append(logoDiv);

    self.$logo = $('.opentok-logo');
    self.$conn = $(conn);

    self.$conn.on('click', function(event) {
      if (typeof self.publisher == 'undefined') {
        self.connect(function() {
          self.$logo.css('display', 'none');
          self.$conn.html('Disconnect');
        });
        self.$logo.animate({
          opacity: 0.2
        }, 1000);
      } else {
        self.$logo.animate({
          opacity: 1
        }, 1000);
        self.session.unpublish(self.publisher);
      }
    });
  },

  connect: function(callback) {
    var self = this;
    var initSize = self.initSize;
    self.session.connect(self.token, function(error) {
      if (error) console.log(error);

      self.publisherFrame = new Frame('publisher',
        self.initSize, self.initSize, self.streams);

      self.frames[self.publisherFrame.id] = self.publisherFrame;

      self.publisher = OT.initPublisher(self.publisherFrame.id, {
        width: initSize,
        height: initSize
      });

      self.publisher.on('streamDestroyed', function() {
        console.log('Publisher\'s stream was destroyed!');
        self.session.disconnect();
        self.publisher = undefined;
        self.$logo.css('display', 'block');
        self.$conn.html('Connect');
        delete self.frames[self.publisherFrame.id];
      });

      self.session.publish(self.publisher, function(err) {
        if (err) throw err;
        console.log('Succesfully published stream to session');
      });

      callback();

    });

    self.layout();
    console.log('Successfully connected TokTok to OpenTok');
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
