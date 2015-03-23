function TokVideo(apikey, sessionId, token) {
  this.session = OT.initSession(apikey, sessionId);
  this.token = token;
  this.subscribers = {};
  this.publisher = undefined;
  this.myStream = undefined;
  this.connectionCount = 0;
  this.maxHeight = '100%';
  this.init();
}

TokVideo.prototype = {
  constructor: TokVideo,
  init: function() {
    var self = this;
    var session = self.session;
    var subscribers = self.subscribers;
    session.connect(self.token, function(error) {
      self.publisher = OT.initPublisher('publisher', {
        width: '100%',
        height: '100%'
      });
      self.publisher.on('streamDestroyed', function() {
        self.publisher = undefined;
        self.mystream = undefined;
      });
      session.publish(self.publisher, function(err) {
        if (err) throw err;
        self.stream = self.publisher.stream;
      });
    });
    session.on({
      'streamCreated': function(event) {
        var conn = event.stream.connection.connectionId;
        var id = 'stream' + conn;
        var url = 'template?id=' + id + '&connectionId=' + conn;
        $.get(url, function(template) {
          $('#streams').append(template);
          subscribers[conn] = session.subscribe(
            event.stream, id, {
              width: '100%',
              height: '100%'
            });
          subscribers[conn].on('destroyed', function(event) {
            delete subscribers[conn];
          });
          var $div = $('.' + id);
          $div.mouseenter(function() {
            $(this).find('.kick').show();
          });
          $div.mouseleave(function() {
            $(this).find('.kick').hide();
          });
          $div.find('.kick').click(function() {
            var connId = $(this).data('connId');
            self.session.forceDisconnect(connId);
          });
          self.layout();
        });
      },
      'streamDestroyed': function(event) {
        $('.stream' + event.stream.connection.connectionId).remove();
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
  },
  layout: function() {
    console.log('Changing layout...');
    var self = this;
    var n = self.connectionCount;
    var h = Math.round(100.0 / n * 100) / 100;
    var newHeight = h.toString() + '%';
    // console.log('New widget height is ' + newHeight);
    // $('#publisher').height(newHeight);
    // console.log(self.subscribers);
    // for (var conn in self.subscribers) {
    //   $(self.subscribers[conn].id).height(newHeight);
    // }
  }
};
