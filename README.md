overload-js
==========

Function overloading in JavaScript for 3.9KB minified, 1.4KB gzipped.

Provides tools to mimic [function overloading][1] that is present in most strictly-types languages. Prevents messy, long, if-statement, type-checking functions that are hard to read and maintain. Style and API inspired by [Moreiki][2] and [Mongoose][3].

[1]: <https://en.wikipedia.org/wiki/Function_overloading>
[2]: <https://github.com/Moeriki/overload-js>
[3]: <http://mongoosejs.com/>

`npm install overload-js`

Basic Usage
-----------

```javascript
var hello = (function() {

	var secret = '!';

	return overload()
		.args().use(function() {
			return secret;
		})
		.args(String).use(function(val) {
			secret = val;
		});

}());

hello('world'); // calls setter
hello(); // returns 'world'
hello(0); // throws a Type Error
```

Detectable types
----------------

```javascript
null
undefined
Infinity
Date
NaN
Number
String
Object
Array
RegExp
Boolean
Function
Element // browser only
```

Overload with a map
----------------

A map can be defined as an overload as well:

```javascript
var hello = overload.map({
		what: String
	}).use(function(obj) {
		return 'hello ' + obj.what;
	});

hello({ what: 'world!' }); // returns 'hello world!'
hello('world'); // throws a Type Error
```

or a map can be used as a custom type (see below):
```javascript
var hello = overload.args(String, o.map({
		what: String
	})).use(function(str, obj) {
		return str + obj.what;
	});

hello('hello', { what: 'world!' }); // returns 'hello world!'
hello('hello', 'world'); // throws a Type Error
```

Custom types
----------------

A custom type can be defined by passing a `string` and validation `function` to
`defineType`. The validation function will be passed the value to validate
and expects a `boolean` return.

```javascript
overload.defineType('$', function(val) {
	return val instanceof jQuery;
});
```

Custom types are available under `o`.

```javascript
var overload = require('overload-js'),
	o = overload.o;
var method = overload().args(o.$).use(function($elem) {
	console.log($elem);
});

method(); // fails
method(''); // fails
method($('body')); // succeeds
```

Additional types
----------------

`o.any()` accepts multiple types that a parameter will match against.

```javascript
var method = overload().args(o.any(String, Number)).use(function() {
	console.log('passed!');
});

method(); // fails
method([]); // fails
method(''); // passed!
method(0); // passed!
```

The inverse of `o.any` is `o.except`.

```javascript
var method = overload().args(o.except(Object)).use(function() {
	console.log('passed!');
});

method(); // passed!
method([]); // passed!
method({}); // fails
```

Also available are `o.truthy` and `o.falsy`.

```javascript
var method = overload()
	.args(o.truthy).use(function() {
		console.log('truthy');
	})
	.args(o.falsy).use(function() {
		console.log('falsy');
	});

method(); // fails
method(0); // falsy
method(1); // truthy
```

Overloading by length
----------------

In addition to overloading by type, argument length can be used.
If a number is not passed, the `function.length` will be used.

```javascript
var method = overload()
		.len(0).use(function() {
			console.log('0 args');
		})
		.len(1).use(function(a) {
			console.log('1 arg');
		})
		.len().use(function(a, b, c) {
			console.log('3 args');
		});

method(); // '0 args'
method({}); // '1 arg'
method(null, [], {}); // '3 args'
```

alias: `count`, `size`

If `args` and `length` are used in the overload, args will be matched
first, followed by length.

Fallback
----------------

A fallback function can be defined via the `fallback` method.

```javascript
var method = overload().args(String).use(function(a) {
				console.log(a);
			})
			.fallback(function() {
				console.log('handled!');
			});
method('hello'); // 'hello'
method(); // 'handled'
```

If a fallback is not defined and the exposed method is called
without a matching function, an error will be thrown...

Expose
----------------

A clean function can be exposed so that overload properties
and methods are hidden from the outside world. 

```javascript
var method = overload()
	.args().use(function() {
		return 'hi';
	})
	.expose();

// method.args === undefined
// method.use === undefined
// etc...
```

Errors
----------------

The error from unmatched calls can be handled by defining your own `err` method on `overload` or
by passing a function to handle the error.

```javascript
overload.err = function() {
	console.log('there was an error');
};

overload()
	.error(function() { console.trace(); })
```

Support
----------------

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/JosephClay/overload-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Node.js, modern browsers and IE8+

To run the tests, simply open test/index.html in your favorite browser or run `npm test`.

#License

The MIT License (MIT)

Copyright (c) 2014 Joseph Clay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
