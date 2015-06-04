function MockPromiseResponse(response) {
  this.response = response;
}

MockPromiseResponse.prototype.then = function (cb) {
  // TODO: implement
};

function MockRequestFactory(response) {
  this.response = response;
}

MockRequestFactory.prototype.getAsync = function (url) {
  return this.response;
};

module.exports = {
  request: MockRequestFactory
};
