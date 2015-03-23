var STATIC = 'http://www.tokbox.com/blog/wp-content/uploads/2014/08/LogoOpenTok.png';

var AtomTalkView = function(url, state, session) {
  // TODO monitor session events from view
  this.prevState = state;
  this.url = url;
  this.count = (typeof state == 'undefined') ? 0 : state.count;
  this.subscribers = 0;
  var iframe = document.createElement('iframe');
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
  this.element = iframe;
};

/**
  @return {obj} div element
*/
AtomTalkView.prototype.getElement = function() {
  return this.element;
};

/**
 To save state of current view before shutting down.
 @return {obj}
 */
AtomTalkView.prototype.serialize = function() {
  return {
    count: this.count
  };
};

/**
 To release any resources before shutting down package
 */
AtomTalkView.prototype.destroy = function() {
  this.element.remove();
};

/**
 Hide modal panel
 */
AtomTalkView.prototype.exit = function() {
  this.element.setAttribute('src', STATIC);
};

/**
 Show modal panel
 */
AtomTalkView.prototype.enter = function() {
    var e = this.element;
    var u = this.url;
    var state = this.prevState || {};
    var c = state.count || 0;

    function redirect(delay) {
        setTimeout(function() {
          e.setAttribute('src', u);
        }, delay);
      }
      //hacky wait til node server is booted up
      c == this.count ? redirect(2000) : redirect(0); this.count += 1;
      };


    /** Anonymous prototype export */
    module.exports = AtomTalkView;
