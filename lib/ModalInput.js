var $ = require('atom').$;


function ModalInput(regex, placeholderMsg, buttonMsg,
  callbackThatNeedsInput, withLogo, closingHandler) {
  var self = this;
  self.id = (placeholderMsg + buttonMsg).replace(/\W|_/g, '');
  var modal = document.createElement('div');
  modal.classList.add('input-group');

  var logoClass = withLogo ? 'class="call"' : '';

  var html = '<div ' + logoClass + '>' +
    '<div id="' + self.id + '-close" class="btn modal-close">close</div>' +
    '</div><div class="native-key-bindings">' +
    '<input type="text" class="input" id="user-select-input"' +
    'placeholder="' + placeholderMsg + '">' +
    '</input><div id="' + self.id + '-select" class="btn input-btn">' +
    buttonMsg + '</div></div>';

  var $modal = $(modal);

  $modal.html(html);

  self.panel = atom.workspace.addModalPanel({
    item: modal,
    visible: true
  });

  var $input = $('#user-select-input');

  function displayErrorMessage() {
    var errorMsg = 'Invalid username! Alphanumerics only and not all numeric.';
    $modal.append('<div class="error">' + errorMsg + '</div>');

  }

  $('#' + self.id + '-close').on('click', function() {
    self.panel.hide();
    if (typeof closingHandler !== 'undefined') {
      closingHandler('');
    }
  });

  $('#' + self.id + '-select').on('click', function() {
    var input = $input.val();
    var isValid = regex.test(input);
    if (isValid) {
      self.input = input;
      callbackThatNeedsInput(input);
      self.panel.hide();
    } else {
      displayErrorMessage();
    }
  });
}

ModalInput.prototype = {
  hide: function() {
    this.panel.hide();
  },

  show: function() {
    this.panel.show();
  },
  toggle: function() {
    console.log('Toggling modal input view...');
    this.panel.isVisible() ? this.hide() : this.show();
  },

  destroy: function() {
    this.panel.destroy();
  }
};

/**
 * anonymous prototype export
 */
module.exports = ModalInput;
