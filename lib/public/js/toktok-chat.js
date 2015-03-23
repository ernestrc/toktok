function TokChat(apiKey, messagingSessionId, messagingToken) {
  this.session = OT.initSession(apiKey, messagingSessionId);

  this.session.on({
    signal: function(signal) {
      var signalData = JSON.parse(signal.data);
      switch (signal.type) {
        case 'signal:init':
          console.log(signalData);
          break;
      }
    }
  });

  this.session.connect(messagingToken, function() {
    this.session.signal({
      type: 'init',
      data: JSON.stringify({
        message: 'Hello World'
      })
    }, function(error) {
      if (error) console.log('Signaling Error: ' + error.reason);
    });
  });
}
