
module.exports = function(events) {
  events.emit('worker_spawned', true);
  events.on('please_close', function() {
    events.emit('terminate');
  });
};