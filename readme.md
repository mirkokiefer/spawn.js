# spawn.js

spawn.js aims to make multi-process programming with Node.js a joy.

The library allows you to spawn any function in a new Node.js instance.

You get back an [EventEmitter](http://nodejs.org/docs/v0.4.7/api/events.html#events.EventEmitter) that you can use to communicate with the spawned worker.

## Example

``` javascript
var spawn = require('spawn');

var helloWorldFunction = function(events) {
  events.on('talk_to_me', function() {
    events.emit('worker_message', 'hello_world');
  });
};

// spawn helloWorldFunction in a new process:
var helloWorldWorker = spawn(helloWorldFunction);

// listen on the helloWorldWorker's EventEmitter:
helloWorldWorker.on('worker_message', function(message) {
  console.log(message);
});

// emit an event that gets propagated to the worker:
helloWorldWorker.emit('talk_to_me');
```

When spawning a function, spawn.js essentially returns you an [EventEmitter](http://nodejs.org/docs/v0.4.7/api/events.html#events.EventEmitter) that gets synced between the master and child process.

So in the example above 'helloWorldWorker' and the 'events' parameter in 'helloWorldFunction' are EventEmitters synced to each other.

## Documentation
You can access the module by doing:

``` javascript
var spawn = require('spawn');
```

### spawn:
``` javascript
var anEventEmitter = spawn(aWorkerFunction);
```
Spawns a new process running aWorkerFunction by passing it an EventEmitter. A synced version of the same EventEmitter gets returned in the spawning master process.
All emits on the returned EventEmitter get copied to the workerFunction's emitter. 

``` javascript
var anEventEmitter = spawn(aWorkerModulePath);
```
Spawns a new process by running the function defined in aWorkerModulePath.
When using this function to spawn a worker you avoid the network and serialization overhead of passing the worker function to the new process. But its of course only half as sexy as having it all defined in one source file...

### worker function:
``` javascript
function(anEventEmitter) { }
```
As the function will get executed within a new Node instance you should not reference anything outside the function's lexical scope.

### worker module:
If you pass a path to spawn you need to have a module defined like this:

``` javascript
module.exports = function(anEventEmitter) { }
```

### EventEmitter:
The event emitters passed to the worker function and returned by spawn, behaves as described in the [Node.js documentation](http://nodejs.org/docs/v0.4.7/api/events.html#events.EventEmitter). As all events are copied between the master's and child's version of the emitter you may only pass objects as event parameters that can be serialized to JSON.

There are only two reserved events on the synced EventEmitters:
#### Event: 'terminate'
``` javascript
function() { }
```
Emitting this event will terminate the worker.

#### Event: 'terminated'
``` javascript
function() { }
```
This event will be emitted when the worker has been terminated.

## Dependencies

Instead of rolling our own custom protocol we rely on the WebWorker API for any communication with spawned workers.

Many thanks to Peter Griess' excellent [node-webworker](https://github.com/mirkok/node-webworker) module implementing the WebWorker API - we use a slightly modified version of his library.