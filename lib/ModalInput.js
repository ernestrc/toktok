var $ = require('atom').$;


function ModalInput(regex, callbackThatNeedsInput) {
  var self = this;
  var modal = document.createElement('div');
  modal.classList.add('input-group');

  var html = '<div class="call">' +
    '<div id="modal-close-btn" class="btn">close</div>' +
    '<div>Call to action</div>' +
    '</div><div class="native-key-bindings">' +
    '<input type="text" class="input" id="user-select-input"' +
    'placeholder="Select your alias...">' +
    '</input><div id="user-select" class="btn input-btn">' +
    'Get Started</div></div>';

  $(modal).html(html);

  self.panel = atom.workspace.addModalPanel({
    item: modal,
    visible: true
  });

  var $input = $('#user-select-input');

  function displayErrorMessage() {
    var errorMsg = 'Invalid username! Alphanumerics only and not all numeric.';
    $(modal).append('<div class="error">' + errorMsg + '</div>');

  }

  $('#modal-close-btn').on('click', function() {
    self.panel.hide();
  });

  $('#user-select').on('click', function() {
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
  self.toggle();
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
  }
};

/**
 * anonymous prototype export
 */
module.exports = ModalInput;
