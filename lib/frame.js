var Frame = function(id, height, width, panel) {
  this.frame = document.createElement('div');
  this.frame.classList.add('toktok-frame');
  this.frame.width = width;
  this.frame.height = height;
  this.frame.id = id;
  this.id = id;
  panel.getItem().appendChild(this.frame);
};

Frame.prototype = {
  layout: function(height, width) {
    this.frame.width = width;
    this.frame.height = height;
  },
  destroy: function() {
    this.frame.remove();
  }
};

/** anonymous prototype export */
module.exports = Frame;
