LivelyWorkers
=====

LivelyWorkers makes multi-process programming with Node.js a joy.

The library allows you to spawn any function in a new Node.js instance.

You get back an [EventEmitter](http://nodejs.org/docs/v0.4.7/api/events.html#events.EventEmitter) that you can use to communicate with the spawned worker:

``` javascript
var worker = require('livelyworkers');

var helloWorldFunction = function(events) {
	events.on('talk_to_me', function() {
		events.emit('worker_message', 'hello_world');
	});
};

// spawn helloWorldFunction in a new process:
var helloWorldWorker = worker.spawn(helloWorldFunction);

// listen on the helloWorldWorker's EventEmitter:
helloWorldWorker.on('worker_message', function(message) {
	console.log(message);
});

// emit an event that gets propagated to the worker:
helloWorldWorker.emit('talk_to_me');
```

When spawning a function, LivelyWorkers essentially returns you an [EventEmitter](http://nodejs.org/docs/v0.4.7/api/events.html#events.EventEmitter) that gets synced between the master and child process.

So in the example above 'helloWorldWorker' and the 'events' parameter in 'helloWorldFunction' are EventEmitters synced to each other.

Instead of rolling our own custom protocol we rely on the WebWorker API for any communication with spawned workers.

Many thanks to Peter Griess' excellent [node-webworker](https://github.com/mirkok/node-webworker) module implementing the WebWorker API - we use a slightly modified version of his library.