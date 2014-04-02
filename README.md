OverloadJS
==========

Function overloading for JavaScript for ~1kb, Minified and Gzipped

Provides tools to mimic [function overloading][1] that is present in most stictly-types languages. Prevents messy, long, if-statement, type-checking functions that are hard to read and maintain.

[1]: <https://en.wikipedia.org/wiki/Function_overloading>


Basic Usage
-----------

```javascript
var hello = (function() {
	
	var overload = new Overload();
	var secret = '!';
	var getter = function() {
		return secret;
	};
	var setter = function(val) {
		secret = val;
	};

	overload.args().use(getter)
			.args(String).use(setter);

	return overload.expose();

}());

hello('world'); // calls setter
hello(); // returns 'world'
```

Custom types
----------------

A custom type can be defined by passing a `string` and validation `function` to 
`defineType`. The validation function will be passed the value to validate
and expects a `boolean` return.

```javascript
Overload.defineType('$', function(val) {
	return val instanceof jQuery;
});
```

Custom types are available under `O`.

```javascript
var method = Overload().args(O.$).use(function($elem) {
	console.log($elem);
}).expose();

method(); // fails
method(''); // fails
method($('body')); // succeeds
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
Element
```

Additional types
----------------

`O.any()` accepts multiple types that a parameter will match against.

```javascript
var method = Overload().args(O.any(String, Number)).use(function() {
	console.log('passed!');
}).expose();

method(); // fails
method([]); // fails
method(''); // passed!
method(0); // passed!
```

The inverse of `O.any` is `O.except`.

```javascript
var method = Overload().args(O.except(Object)).use(function() {
	console.log('passed!');
}).expose();

method(); // passed!
method([]); // passed!
method({}); // fails
```

Also available are `O.truthy` and `O.falsy`.

```javascript
var overload = Overload();

overload.args(O.truthy).use(function() {
	console.log('truthy');
});
overload.args(O.falsy).use(function() {
	console.log('falsy');
});

var method = overload.expose();

method(); // fails
method(0); // falsy
method(1); // truthy
```

Overloading by length
----------------

In addition to overloading by type, argument length can be used.
If a number is not passed, the `function.length` will be used.

```javascript
var method = Overload()
		.length(0).use(function() {
			console.log('0 args');
		})
		.length(1).use(function(a) {
			console.log('1 arg');
		})
		.length().use(function(a, b, c) {
			console.log('3 args');
		})
		.expose();

method(); // '0 args'
method({}); // '1 arg'
method(null, [], {}); // '3 args'
```

If `args` and `length` are used in the overload, args will be matched 
first, followed by length.

Fallback
----------------

A fallback function can be defined via the `fallback` method.

```javascript
var method = Overload().args(String).use(function(a) {
				console.log(a);
			})
			.fallback(function() {
				console.log('handled!');
			})
			.expose();
method('hello'); // 'hello'
method(); // 'handled'
```

If a fallback is not defined and the exposed method is called
without a matching function, an error will be thrown...

Erros
----------------

The error from unmatched calls can be handled by defining your own `err` method on `Overload`.

```javascript
Overload.prototype.err = function() {
	console.log('there was an error');
};
```

Support
----------------

Modern browsers and IE8+

It may work in older (IE7 and lower) browser, but no guarantees, it hasn't been tested in older browsers.
