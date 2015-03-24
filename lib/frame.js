var Frame = function(height, width, url, panel) {
  var i = document.createElement('iframe');
  i.classList.add('toktok-iframe');
  i.width = width;
  i.id = 'publisher';
  i.height = height;
  i.frameBorder = 0;
  i.scrolling = 'no';
  i.setAttribute('src', url);
  this.iframe = i;
  panel.getItem().appendChild(this.iframe);
};

Frame.prototype = {
  layout: function(height, width) {
    this.iframe.width = width;
    this.iframe.heifht = height;
  },
  destroy: function() {
    this.iframe.remove();
  }
};

/** anonymous prototype export */
module.exports = Frame;
