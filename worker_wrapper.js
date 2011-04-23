var vm = require('vm');
var sys = require('sys');
var lcUtils = require(__dirname + '/utils');
var createSyncedEmitter = lcUtils.createSyncedEmitter;
var objectToArray = lcUtils.objectToArray;

var events;

var startWorker = function(workerCode) {
  var workerFromCode = function(workerCode) {
  	try {
  		var sandbox = {tempFun: null};
  		vm.runInNewContext('tempFun = ' + workerCode, sandbox, 'worker_instance.js');
  		return sandbox.tempFun;
  	} catch(e) {
  		console.log(e);
  	}
  };
  var workerFun = workerFromCode(workerCode);
	events = createSyncedEmitter();
	events.onAll(function() {
	  postMessage({arguments: objectToArray(arguments)});
	});
	workerFun(events);
};
onmessage = function(e) {
  console.log("worker: " + JSON.stringify(e.data));
  var message = e.data;
	if(!events) {
		startWorker(message.workerCode);
	} else {
		events.constructor.prototype.emit.apply(events, message.arguments);
	}
};

onclose = function() {
  sys.debug('Worker shutting down.');
  if(events) {
	  events.emit('close');
  }
};