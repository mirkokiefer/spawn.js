var assert = require('assert');
var vows = require('vows');
var spawn = require('../spawn');

var testWorkerFunction = function(events) {
  events.emit('worker_spawned', true);
  events.on('message', function(message) {
    events.emit('worker_received', message);
  });
  events.on('please_close', function() {
    events.emit('terminate');
  });
};

//helper function to generate and access topic objects:
var testCb = function(events, testValue) {
  return {
    events: function() {
      return events;
    },
    testValue: function() {
      return testValue;
    }
  };
};


vows.describe('workers').addBatch({
  'spawned worker from function:':  {
    topic: function() {
      var that = this;
      var events = spawn(testWorkerFunction);
      events.on('worker_spawned', function(success) {
        that.callback(null, testCb(events, success));
      });
    },
    'sends start notification': function(err, obj) {
      assert.isTrue(obj.testValue());
    },
    'emit message event': {
      topic: function(obj) {
        var that = this;
        var events = obj.events();
        events.on('worker_received', function(message) {
          that.callback(null, testCb(events, message));
        });
        events.emit('message', 'test_message');
      },
      'worker responds': function(err, obj) {
        assert.equal(obj.testValue(), 'test_message');
      },
      'ask worker to exit:': {
        topic: function(obj) {
          var that = this;
          var events = obj.events();
          events.on('terminated', function() {
            that.callback(null, testCb(events, true));
          });
          events.emit('please_close');
        },
        'worker dies nicely:': function(err, obj) {
          assert.isTrue(obj.testValue());
        }
      }
    }
  },
  'spawned worker from file:': {
    topic: function() {
      var that = this;
      var events = spawn(__dirname + '/worker-file.js');
      events.on('worker_spawned', function(success) {
        that.callback(null, testCb(events, success));
      });
    },
    'sends start notification': function(err, obj) {
      assert.isTrue(obj.testValue());
    }
  }
}).export(module);