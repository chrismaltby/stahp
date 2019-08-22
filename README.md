# Stahp

> Guard against infinite loops in Javascript code by injecting timeouts

Copyright (c) 2019 Chris Maltby, released under the [MIT license](https://opensource.org/licenses/MIT).

Twitter: [@maltby](https://www.twitter.com/maltby)

Stahp is a Node module that takes in a string of Javascript code and outputs the same code updated with guards added to throw a timeout error if any loops cause the execution to take longer than a specified amount of time.

For example with the following input:

```
while (true) {
  console.log("Infinite Loop?");
}
```

Stahp will output:

```
var ___timeout___ = Date.now();
while (true) {
    if (Date.now() > ___timeout___ + 1000) {
        throw new Error('Timed out');
    }
    console.log('Infinite Loop?');
}
```

causing the execution to stop after one second.

The concept is based on a blog post by [@quezo](https://github.com/quezo)  
[https://codepen.io/quezo/post/stopping-infinite-loops](https://codepen.io/quezo/post/stopping-infinite-loops). Internally Stahp is using [esprima](https://esprima.org) to convert the input Javascript into an AST which is then modified and turned back into into Javascript using [escodegen](https://github.com/estools/escodegen).

If handling untrusted code it is recommended to use this alongside a module like [VM2](https://github.com/patriksimek/vm2). While VM2 does have some support for timeouts but this isn't available in all cases and doesn't appear to work while calling from an Electron app.

## Installation

```
npm install stahp
```

## Quick Example

```
const stahp = require("stahp");

const input = `while (true) {
  console.log("Infinite Loop?");
}`;

const output = stahp(input, {
	timeout: 100
});

console.log(output);
```

## stahp(code, options)

The first argument is a string of valid Javascript code, the second argument is an optional `options` object that can contain the following:

- `timeout` Optional object containing additional arguments (default 1000)
