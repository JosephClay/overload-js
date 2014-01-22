OverloadJS
==========

Function overloading for JavaScript

Provides tools to mimic [function overloading][1] that is present in most stictly-types languages.

[1]: <https://en.wikipedia.org/wiki/Function_overloading>


Basic Usage
-----------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Custom types
----------------

A custom type can be defined by passing a `string` and validation `function` to 
`defineType`. The validation function will be passed the value to validate
and expects a `boolean` return.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Overload.defineType('$', function(val) {
	return val instanceof jQuery;
});
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Custom types are available under `O`.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var method = Overload().args(O.$).use(function($elem) {
	console.log($elem);
}).expose();

method(); // fails
method(''); // fails
method($('body')); // succeeds
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Detectable types
----------------
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Additional types
----------------

`O.any()` accepts multiple types that a parameter will match against.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var method = Overload().args(O.any(String, Number)).use(function() {
	console.log('passed!');
}).expose();

method(); // fails
method([]); // fails
method(''); // passed!
method(0); // passed!
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The inverse of `O.any` is `O.except`.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var method = Overload().args(O.except(Object)).use(function() {
	console.log('passed!');
}).expose();

method(); // passed!
method([]); // passed!
method({}); // fails
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Also available are `O.truthy` and `O.falsy`.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

### ToDo's
-   Optimizations
-   Document adding and using custom types
-   infinite arguments
