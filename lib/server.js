var config = require('../config.json');
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var opentok = new(require('opentok'))(config.apiKey, config.apiSecret);
var server = module.exports;

var HOST = '127.0.0.1';
var PORT = 2899;
var URL = 'http://' + HOST + ':' + PORT;

var mimeTypes = {
  'js': 'text/javascript',
  'css': 'text/css'
};

var messagingSessionId = config.sessionId;
var messagingToken = opentok.generateToken(messagingSessionId);
var videoSessionId;

var analytics = fs.readFileSync(path.join(
  __dirname, 'public', 'js', 'analytics.js'), {
  encoding: 'utf8'
});

function createServer(state, callback) {
  var server = http.createServer().listen(PORT, HOST);

  function init(videoSessionId) {
    var videoToken = opentok.generateToken(videoSessionId, {
      role: 'moderator',
    });
    server.on('request', function(req, res) {
      var parsed = url.parse(req.url, true);
      var uri = parsed.pathname;
      var query = parsed.query;
      switch (uri) {
        case '/':
          fs.readFile(path.join(__dirname, 'views', 'toktok-video.html'), {
            encoding: 'utf8'
          }, function(err, html) {
            html = html.replace('@apikey', config.apiKey)
              .replace('@analytics', analytics)
              .replace('@videoSessionId', videoSessionId)
              .replace('@videoToken', videoToken);
            res.write(html);
            res.end();
          });
          break;
        case '/chat':
          fs.readFile(path.join(__dirname, 'views', 'toktok-chat.html'), {
            encoding: 'utf8'
          }, function(err, html) {
            html = html.replace('@apikey', config.apiKey)
              .replace('@analytics', analytics)
              .replace('@messagingSessionId', messagingSessionId)
              .replace('@messagingToken', messagingToken);
            res.write(html);
            res.end();
          });
          break;
        case '/template':
          console.log('Supplying template...');
          fs.readFile(path.join(__dirname, 'views', '__template.html'), {
            encoding: 'utf8'
          }, function(err, html) {
            html = html.replace(/@id/g, query.id)
              .replace('@connectionId', query.connectionId);
            res.write(html);
            res.end();
          });
          break;
        default: //static files
          console.log('Uri is ' + uri);

          function notFound(res) {
            res.writeHead(404, {
              'Content-Type': 'text/plain'
            });
            res.end('404 Not Found');
          };
          var filename = path.join(__dirname, uri);
          console.log('File name is ' + filename);
          fs.stat(filename, function(err, stats) {
            if (err || typeof stats == typeof undefined) {
              notFound(res);
            } else if (stats.isFile()) { //serve static file
              var mimeType = mimeTypes[path.extname(filename).split('.')[1]];
              console.log('Static file ' + filename +
                ' exists. Mimetype is ' + mimeType);
              res.writeHead(200, {
                'Content-Type': mimeType
              });
              var fileStream = fs.createReadStream(filename);
              fileStream.pipe(res);
            } else {
              notFound(res);
            }
          });
      }
    });
    callback(URL, videoSessionId);
  };

  if (typeof state == 'undefined' || !state.hasOwnProperty('ses')) {
    console.log('Initializing fresh TokTok instance');
    opentok.createSession(function(err, session) {
      if (err) throw err;
      console.log('Succesfully created new session!');
      videoSessionId = session.sessionId;
      init(videoSessionId);
    });
  } else {
    console.log('Initializing TokTok from state');
    init(state.ses);
  }
};

server.createServer = createServer;

server.generateToken = function() {
  return opentok.generateToken(videoSessionId);
}

server.serialize = function() {
  return {
    ses: videoSessionId
  };
};

server.destroy = function() {};

server.url = URL;

// createServer(undefined, function() {});
