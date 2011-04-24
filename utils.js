var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

var createExtendedEmitter = function() {
  var emitter = new EventEmitter();
  var syncedEmitter = _.create(emitter);
  var globalListeners = [];
  syncedEmitter.onAll = function(listener) {
    globalListeners.push(listener);
  }
  syncedEmitter.emit = function(event) {
    var eventArgs = arguments;
    globalListeners.forEach(function(each) {
      each.apply(null, eventArgs);
    })
    this.constructor.prototype.emit.apply(this, arguments);
  }
  syncedEmitter.setMaxListeners(0);
  return syncedEmitter;
}

var objectToArray = function(object) {
  var array = [];
  for(var i in object) {
    array.push(object[i]);
  }
  return array;
}

exports.createExtendedEmitter = createExtendedEmitter;
exports.objectToArray = objectToArray;