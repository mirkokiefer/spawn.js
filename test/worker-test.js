var assert = require('assert');
var vows = require('vows');
var worker = require('../worker');

var testWorkerFunction = function(events) {
  events.emit('worker_spawned', true);
	events.on('message', function(message) {
	  events.emit('worker_received', message);
	});
	events.on('please_close', function() {
	  events.emit('terminate');
	});
};

var events;
vows.describe('workers').addBatch({
	'spawned worker:':  {
		topic: function() {
			var that = this;
			events = worker.spawn(testWorkerFunction);
			events.on('worker_spawned', function(success) {
			  that.callback(null, success);
			});
		},
		'sends start notification': function(err, success) {
			assert.isTrue(success);
		},
		'emit message event': {
		  topic: function() {
		    var that = this;
		    events.on('worker_received', function(message) {
		      that.callback(null, message)
		    });
		    events.emit('message', 'test_message');
		  },
		  'worker responds': function(err, message) {
		    assert.equal(message, 'test_message');
		  }
		}
	}
}).export(module);