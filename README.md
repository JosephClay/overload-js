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

### ToDo's
-   Optimizations
-   Document adding and using custom types
-   infinite arguments
