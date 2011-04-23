var assert = require('assert');
var vows = require('vows');
var worker = require('../worker');

var testWorkerFunction = function(events) {
  events.emit('worker_spawned', true);
	events.on('message', function(message) {
	  events.emit('worker_received_' + message);
	});
	events.on('close', function() {
	  events.emit('closing_worker');
	});
};

vows.describe('workers').addBatch({
	'spawned worker:':  {
		topic: function() {
			var that = this;
			var events = worker.spawn(testWorkerFunction);
			events.on('worker_spawned', function(success) {
			  that.callback(null, success);
			});
		},
		'sends start notification': function(err, success) {
			assert.isTrue(success);
		}
	}
}).export(module);