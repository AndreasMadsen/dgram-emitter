
var util = require('util');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;

function DgramEmitterState() {
  // Message queue properties
  this.messages = [];
  this.listening = false;

  // connection configurations
  this.port = 0;
  this.host = '0.0.0.0';
  this.address = '224.0.0.1';
}

function dgramSend(socket, state, data) {
  socket.send(
    data, 0, data.length,
    state.port, state.address,
    function(err, bytes) {
      if (err) return socket.emit('error', err);
    }
  );
}

function DgramEmitter(type) {
  if (!(this instanceof DgramEmitter)) return new DgramEmitter(type);
  EventEmitter.call(this);
  var self = this;

  // Setup UDP socket
  this.socket = dgram.createSocket({type: type || 'udp4', reuseAddr: true});

  // Setup message handler
  this.socket.on('message', function (data) {
    var json = parseJSON(data);
    if (json instanceof Error) {
      self.socket.emit('error', json);
    } else {
      EventEmitter.prototype.emit.apply(self, json);
    }
  });

  // Create internal state object
  var state = this._dgramState = new DgramEmitterState();

  this.socket.on('listening', function () {
    // Set multicast flags
    self.socket.setBroadcast(true);
    self.socket.setMulticastLoopback(true);
    self.socket.addMembership(state.address, state.host);

    // Cache the destionation details
    state.listening = true;

    // Flush the message queue
    state.messages.forEach(dgramSend.bind(null, self.socket, state));
    state.messages = [];
  });
  this.socket.on('close', function () {
    state.listening = false;
  });
}
util.inherits(DgramEmitter, EventEmitter);
module.exports = DgramEmitter;

DgramEmitter.prototype.emit = function (name) {
  var self = this;
  var state = this._dgramState;

  // Create message buffer
  var args = [name + ''];
  for (var i = 1, l = arguments.length; i < l; i++) {
    args.push(arguments[i]);
  }
  var data = new Buffer(JSON.stringify(args));

  // Check that socket is listening
  if (state.listening === false) {
    state.messages.push(data);
  } else {
    dgramSend(self.socket, state, data);
  }
};

DgramEmitter.prototype.listen = function () {
  var state = this._dgramState;
  var args = Array.prototype.slice.call(arguments);

  var callback;
  if (typeof args[args.length - 1] === 'function') callback = args.pop();

  // Set connection configureations
  //  yes this is meant to fall though :)
  switch (args.length) {
    case 3:
      state.host = args[2];
    case 2:
      state.address = args[1];
    case 1:
      state.port = Number(args[0]);
  }

  if (state.port <= 0) throw new Error('port must be a positive number');

  this.socket.bind(state.port, state.host, callback);
};

DgramEmitter.prototype.close = function (callback) {
  if (callback) this.socket.once('close', callback);
  this.socket.close();
};

function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return e;
  }
}
