#dgram-emitter

> Very simple EventEmitter on top of a UDP server/client

## Installation

```sheel
npm install dgram-emitter
```

## Example

```JavaScript
var DgramEmitter = require('dgram-emitter');

var ee = new DgramEmitter();

ee.listen(5000);

ee.on('event', function (msg) {
  console.log(msg);
});
ee.emit('event', { from: process.pid });
```

Try spawning a couple of processes with the above code and you will get:

```shell
$ node a.js
{ from: 2335 }
{ from: 2336 }
```

## Documentation

### ee = new DgramEmitter([type = 'udp4'])

The DgramEmitter constructor is a `EventEmitter` with an underlying `UDP` socket.
Just creating the object won't allow you to receive events, for that you will
have to call the `.listen` method. But until you do so, emits will be stored
in a queue stack.

Note that you can also inherit from the `DgramEmitter`, but if you chose to
do so, you should avoid overwriting the `._dgramState` properties and remember
to call the constructor function.

```javascript
function Layer() {
  DgramEmitter.call(this);

  // Do your stuff
}
util.inherits(Layer, DgramEmitter);
```

### ee.listen(port, [address = '244.0.0.1'], [host = '0.0.0.0'], [callback])

This will bind underlying `UDP` socket to the given `host` on the specified `port`
and tell the kernel to add the socket to the multicast `address`. When this is
done the `callback` will be executed.

### ee.close([callback])

This will close the underlying `UDP` socket preventing more events from being
rescived.

### ee.socket

This is the underlying `UDP` socket, for its API please the the node.js
[documentation](http://nodejs.org/api/dgram.html).

### ee.emit(eventName, [args], [...])
### ee.on(eventName, [args], [...])

The `DgramEmitter` inherits all the methods from [EventEmitter](http://nodejs.org/api/events.html).

##License

**The software is license under "MIT"**

> Copyright (c) 2013 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
