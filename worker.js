var sys = require('sys');
var path = require('path');
var Worker = require('webworker').Worker;
var createSyncedEmitter = require('./utils').createSyncedEmitter;
var objectToArray = require('./utils').objectToArray;

var workers = [];

var workerHandler = (function() {
	var obj = {};
	obj.spawn = function(workerFun) {
		var worker = new Worker(path.join(__dirname, 'worker_wrapper.js'));
		workers.push(worker);
		var emitter = createSyncedEmitter();
		emitter.onAll(function() {
		  console.log("onAll: " + JSON.stringify(arguments));
  		worker.postMessage({arguments: objectToArray(arguments)});		    
		});
		worker.onmessage = function(e) {
			var event = e.data.arguments;
			console.log("master: " + JSON.stringify(event));
		  emitter.constructor.prototype.emit.apply(emitter, event);
		};
		worker.postMessage({workerCode: workerFun.toString()});
		return emitter;
	};
	return obj;
}());

exports.spawn = workerHandler.spawn;