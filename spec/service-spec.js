"use strict";

var Service = require('../lib/__Service');
var bluebird = require('bluebird');
var request = bluebird.promisifyAll(require('request'));

var service = new Service({}, 'http://localhost:2828/v1', 'http://localhost:4646/v1', request);

describe("Service unit tests", function () {
  var username = 'foo' + (Math.random() * 1000).toString();
  var email = 'ernest+' + username + '@unstable.build';
  var userId;
  var sessionId;

  var testRoute = function (promise, dataCallback) {
    var data, errors;
    var done = false;

    runs(function () {
      promise.then(function (d) {
        data = d;
        console.log("Successfully queried service route. Data is " + data.toString());
      }).catch(function (err) {
        console.log("Failed to query service route");
        console.error(err);
        errors = err;
      }).finally(function () {
        console.log("Done with querying service");
        done = true;
      });
    });

    waitsFor(function () {
      return done;
    }, "Promise should be fulfilled successfully", 3000);

    runs(function () {
      if (typeof dataCallback != "undefined") {
        dataCallback(data);
      }
      if (typeof data.success != "undefined") {
        expect(data.success).toBe(true);
      }
      if (typeof data.errors != "undefined" && data.errors.length > 0) {
        console.error(data);
      }
      expect(errors).toBeUndefined();
    });

  };

  it("create a new user", function () {
    testRoute(service.createNewUser(username, 'password', email),
      function (data) {
        userId = data.entity;
      });
  });

  it("should activate a user", function () {
    testRoute(service.activateUser(userId), function (data) {
      expect(data.success).toBe(true);
    });
  });

  it("should save data to analytics endpoint", function () {
    testRoute(service.log({
      test: true
    }), function (data) {
      expect(data).toBe('OK');
    });
  });

  it("should allow users to recover password", function () {
    testRoute(service.forgotPassword(username, email), function (data) {
      expect(data.message).toBe('OK');
    });
  });

  it("should get an opentok session from a user id", function () {
    setTimeout(function () {
      testRoute(service.getUserSession(userId), function (data) {
        expect(data.entity).not.toBeUndefined();
        expect(data.entity.sessionId).not.toBeUndefined();
        expect(data.entity.userId).toBe(userId);
        sessionId = data.entity.sessionId;
      });
    }, 500);
  });

  it("should generate an opentok token from a session id", function () {
    setTimeout(function () {
      testRoute(service.generateToken(sessionId), function (data) {
        expect(data.entity).not.toBeUndefined();
        expect(data.entity.token).not.toBeUndefined();
        expect(data.entity.userId).toBe(sessionId);
      });
    }, 1000);
  });

  it("should search users by username", function () {
    testRoute(service.searchUser(username), function (data) {
      expect(data.entity).not.toBeUndefined();
      expect(data.entity.users[0].id).toBe(userId);
      expect(data.entity.users[0].username).toBe(username);
    });
  });

  it("should search online users", function () {
    testRoute(service.searchOnline(userId, [userId]), function (data) {
      expect(data.entity).not.toBeUndefined();
      expect(data.entity.users[0]).toBe(userId);
    });
  });

});
