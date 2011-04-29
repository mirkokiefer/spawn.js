var path = require('path');
var Worker = require('webworker').Worker;
var createExtendedEmitter = require('./utils').createExtendedEmitter;
var objectToArray = require('./utils').objectToArray;

var workerHandler = (function() {
	var obj = {};
	obj.spawn = function(funOrPath) {
		var worker = new Worker(path.join(__dirname, 'worker_wrapper.js'));
		var emitter = createExtendedEmitter();
		emitter.on('terminate', function() {
		  worker.terminate();
		  worker = undefined;
		  emitter.emit('terminated');
		});
		emitter.onAll(function() {
		  if(worker) {
  		  worker.postMessage({arguments: objectToArray(arguments)});		    
		  }
		});
		worker.onmessage = function(e) {
			var event = e.data.arguments;
		  emitter.constructor.prototype.emit.apply(emitter, event);
		};
		if(funOrPath.constructor == Function) {
  		worker.postMessage({workerCode: funOrPath.toString()});		  
		} else {
		  worker.postMessage({workerPath: funOrPath});	
		}
		return emitter;
	};
	return obj;
}());

module.exports = workerHandler.spawn;