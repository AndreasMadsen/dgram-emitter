
var test = require('tap').test;
var async = require('async');
var DgramEmitter = require('./dgram-emitter.js');

var PORT = 10023;

test('port number must be positive', function (t) {
  var ee = new DgramEmitter();

  try {
    ee.listen();
  } catch (e) {
    t.equal(e.message, 'port must be a positive number');
  }

  try {
    ee.listen(0);
  } catch (e) {
    t.equal(e.message, 'port must be a positive number');
  }

  t.end();
});

test('listen method takes listening callback', function (t) {
  var ee = new DgramEmitter();

  ee.listen(PORT, function () {
    t.deepEqual(ee.socket.address(), {
      address: '0.0.0.0',
      family: 'IPv4',
      port: PORT
    });

    ee.close();
  });

  ee.socket.once('close', function () {
    setTimeout(t.end.bind(t), 500);
  });
});

test('dgram emitter gets its own messages', function (t) {
  var ee = new DgramEmitter();

  ee.listen(PORT);

  ee.once('event', function (data) {
    t.equal(data, 'message');

    ee.close();
  });

  ee.emit('event', 'message');

  ee.socket.once('close', function () {
    setTimeout(t.end.bind(t), 500);
  });
});

function bothEvent(ee1, ee2, callback) {
  async.parallel([
    function (done) {
      ee1.once('event', function (msg) { done(null, msg); });
    },
    function (done) {
      ee2.once('event', function (msg) { done(null, msg); });
    }
  ], callback);
}

function bothClose(ee1, ee2, callback) {
  async.parallel([
    function (done) {
      ee1.close(done);
    },
    function (done) {
      ee2.close(done);
    }
  ], callback);
}

test('two dgram emitters can communicate', function (t) {
  var ee1 = new DgramEmitter();
      ee1.listen(PORT);

  var ee2 = new DgramEmitter();
      ee2.listen(PORT);

  bothEvent(ee1, ee2, function (err, got) {
    t.equal(err, null);
    t.deepEqual(got, ['from 1', 'from 1']);

    bothEvent(ee1, ee2, function (err, got) {
      t.equal(err, null);
      t.deepEqual(got, ['from 2', 'from 2']);

      bothClose(ee1, ee2, function () {
        t.end();
      });
    });

    ee2.emit('event', 'from 2');
  });

  ee1.emit('event', 'from 1');
});
