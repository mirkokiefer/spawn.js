var vm = require('vm');
var sys = require('sys');
var lcUtils = require(__dirname + '/utils');
var createExtendedEmitter = lcUtils.createExtendedEmitter;
var objectToArray = lcUtils.objectToArray;

var events;

var startWorker = function(message) {
  var workerFun;
  var workerFromCode = function(workerCode) {
    try {
      var sandbox = {tempFun: null};
      vm.runInNewContext('tempFun = ' + workerCode, sandbox, 'worker_instance.js');
      return sandbox.tempFun;
    } catch(e) {
      sys.debug(e);
    }
  };
  var workerFromFile = function(workerPath) {
    return require(workerPath);
  }
  if(message.workerCode) {
    workerFun = workerFromCode(message.workerCode);
  } else {
    workerFun = workerFromFile(message.workerPath);
  }
  events = createExtendedEmitter();
  events.onAll(function() {
    postMessage({arguments: objectToArray(arguments)});
  });
  workerFun(events);
};

onmessage = function(e) {
  var message = e.data;
  if(!events) {
    startWorker(message);
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