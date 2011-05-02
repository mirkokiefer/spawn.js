var path = require('path');
var Worker = require('webworker').Worker;
var createExtendedEmitter = require('./utils').createExtendedEmitter;
var objectToArray = require('./utils').objectToArray;

var spawn = (function() {
  var wrapWorkerInEmitter = function(worker) {
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
    return emitter;
  };
  var sendFunction = function(funOrPath, worker) {
    if(funOrPath.constructor == Function) {
      worker.postMessage({workerCode: funOrPath.toString()});		  
    } else {
      worker.postMessage({workerPath: funOrPath});	
    }
  }
  return function(funOrPath) {
    var worker = new Worker(path.join(__dirname, 'worker_wrapper.js'));
    var emitter = wrapWorkerInEmitter(worker);
    sendFunction(funOrPath, worker);
    return emitter;
  };
}());

module.exports = spawn;