function Service(state, serviceUrl, analyticsUrl, requestLayer) {
  this.serviceUrl = serviceUrl;
  this.analyticsUrl = analyticsUrl;
  this.request = requestLayer;

  this.sessionId = undefined;
}

Service.prototype.__get = function (route) {
  return this.request.getAsync({
    url: this.serviceUrl + route,
    rejectUnauthorized: false
  }).then(function (response) {
    console.log('Finished GET request to ' + route + ' with status code ' + response[0].statusCode);
    return JSON.parse(response[0].toJSON().body);
  });
};

Service.prototype.__post = function (route, data) {
  return this.request.postAsync({
    url: this.serviceUrl + route,
    body: JSON.stringify(data)
  }).then(function (response) {
    console.log('Finished POST request to ' + route + ' with status code ' + response[0].statusCode);
    return JSON.parse(response[0].body);
  });
};

Service.prototype.activateUser = function (userId) {
  return this.__get('/users/activate/' + userId);
};

Service.prototype.changeUserPassword = function (userId, oldPass, newPass) {
  return this.__post('/users/password', {
    entityId: userId,
    oldPass: oldPass,
    newPass: newPass
  });
};

Service.prototype.createNewUser = function (username, password, email) {
  return this.__post('/users', {
    username: username,
    password: password,
    email: email
  });
};

Service.prototype.log = function (data) {
  return this.request.postAsync({
    url: this.analyticsUrl + '/analytics',
    body: JSON.stringify(data)
  }).then(function (response) {
    return response[0].body;
  });
};

Service.prototype.forgotPassword = function (username, email) {
  return this.__post('/users/recover', {
    username: username,
    email: email
  });
};

Service.prototype.getUserSession = function (userId) {
  return this.__get('/session/' + userId);
};

Service.prototype.generateToken = function (sessionId) {
  return this.__get('/token?sessionId=' + sessionId);
};

Service.prototype.searchUser = function (username) {
  return this.__get('/users?query=' + username);
};

Service.prototype.searchOnline = function (requester, users) {
  return this.__post('/online', {
    requester: requester,
    users: users
  });
};

Service.prototype.serialize = function () {
  return {
    sessionId: this.sessionId
  };
};

Service.prototype.destroy = function () {};

/**
 * Anonymous prototype export
 */
module.exports = Service;
