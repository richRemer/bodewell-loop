Bodewell Loop
=============
This package exports the Bodewell `Loop` class used by the Bodewell server and
related plugins to execute a function in a loop.

```js
const Loop = require("bodewell-loop");
const doWork = require("my-function-returning-Promise");

var loop = new Loop(doWork);

loop.start();
loop.changeInterval(10000);     // run no more than every 10,000 milliseconds

// trigger the loop if between runs
loop.now();

// shutdown the loop
loop.stop();
```
