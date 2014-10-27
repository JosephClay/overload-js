test('basics', function() {
	ok(overload, 'overload exists');
	ok(overload() instanceof overload, 'overload object created');

	ok(o, 'o exists');
	ok(o.any, 'o.any exists');
	ok(o.truthy, 'o.truthy exists');
	ok(o.falsy, 'o.falsy exists');
});

test('method registration', function() {
	var a = function() { return false; },
		b = function() { return true; };

	var o = overload();
	o.args().use(a);

	ok(_.isFunction(o.expose()), 'Expose is a function');
	strictEqual(o.expose()(), false, 'Method registered and called');
	strictEqual(o.expose()(), false, 'Method returns return value');
	strictEqual(o.expose()(), false, 'overload can be used without arguments');
});

test('overload paths', function() {
	var overload = overload();

	overload.args(null).use(function() { return null; })
			.args(undefined).use(function() { return undefined; })
			.args(Infinity).use(function() { return Infinity; })
			.args(Date).use(function() { return Date; })
			.args(NaN).use(function() { return NaN; })
			.args(Number).use(function() { return Number; })
			.args(String).use(function() { return String; })
			.args(Object).use(function() { return Object; })
			.args(Array).use(function() { return Array; })
			.args(RegExp).use(function() { return RegExp; })
			.args(Boolean).use(function() { return Boolean; })
			.args(Function).use(function() { return Function; })
			.args(Element).use(function() { return Element; });

	var method = overload.expose();

	var types = [
		{
			type: null,
			name: 'null',
			param: null
		},
		{
			type: undefined,
			name: 'undefined',
			param: undefined
		},
		{
			type: Infinity,
			name: 'Infinity',
			param: Infinity
		},
		{
			type: Date,
			name: 'Date',
			param: new Date()
		},
		{
			type: Number,
			name: 'Number',
			param: 0
		},
		{
			type: String,
			name: 'String',
			param: ''
		},
		{
			type: Object,
			name: 'Object',
			param: {}
		},
		{
			type: Array,
			name: 'Array',
			param: []
		},
		{
			type: RegExp,
			name: 'RegExp',
			param: /-/gi
		},
		{
			type: Boolean,
			name: 'Boolean',
			param: false
		},
		{
			type: Function,
			name: 'Function',
			param: function() {}
		},
		{
			type: Element,
			name: 'Element',
			param: document.getElementsByTagName('body')[0]
		}
	];

	var idx = types.length;
	while (idx--) {
		var type = types[idx];
		strictEqual(method(type.param), type.type, type.name + ' passed overload test');
	}

	// NaN is special because NaN !== NaN
	strictEqual(_.isNaN(method(NaN)), _.isNaN(NaN), 'NaN passed overload test');
});

test('"this" context', function() {
	var a = function() { return this; };

	var o = overload();
	o.args().use(a);

	var method = o.expose();

	equal(method.call('one'), 'one', 'Exposed method can be called with context');
	equal(method.apply('two'), 'two', 'Exposed method can be applied with context');
	equal(method.bind('three')(), 'three', 'Exposed method can be bound with context');
	equal(o.call('four'), 'four', 'overload can be called directly with context');
	equal(o.apply('five'), 'five', 'overload can be called applied with context');
	equal(o.bind('six')(), 'six', 'overload can be bound with context');
});

test('truthy', function() {
	var a = function() { return true; };

	var o = overload();
	o.err = function() { return 'error'; };
	o.args(o.truthy).use(a);

	var method = o.expose();

	strictEqual(method(1), true, 'truthy works with #1');
	strictEqual(method(true), true, 'truthy works with true');
	strictEqual(method('1'), true, 'truthy works with "1"');
	strictEqual(method({}), true, 'truthy works with Object');
	strictEqual(method([]), true, 'truthy works with Array');
	strictEqual(method(0), 'error', 'truthy throws error with falsy value');
});

test('falsy', function() {
	var a = function() { return false; };

	var o = overload();
	o.err = function() { return 'error'; };
	o.args(o.falsy).use(a);

	var method = o.expose();

	strictEqual(method(0), false, 'falsy works with #0');
	strictEqual(method(false), false, 'falsy works with false');
	strictEqual(method(''), false, 'falsy works with ""');
	strictEqual(method(null), false, 'falsy works with null');
	strictEqual(method(undefined), false, 'falsy works with undefined');
	strictEqual(method(1), 'error', 'falsy throws error with truthy value');
});

test('length', function() {
	var a = function() { return 1; },
		b = function() { return 2; },
		c = function() { return 3; };

	var o = overload();
	o.length(0).use(a);
	o.length(1).use(b);
	o.length(2).use(c);

	var method = o.expose();
	strictEqual(method(), 1, 'No params called first function');
	strictEqual(method(1), 2, 'One param called second function');
	strictEqual(method(1, 2), 3, 'Two params called third function');

	var ov = overload();
	ov.length().use(function(a, b, c, d) { return 4; });

	var method2 = ov.expose();

	strictEqual(method2(1, 2, 3, 4), 4, 'No length gets length from function');
});

test('any', function() {
	var a = function() { return 0; },
		b = function() { return 1; };

	var o = overload();
	o.err = function() { return 'error'; };
	o.args(o.any(String, Boolean, Date)).use(a);
	o.args(o.any(Array, Object, Function)).use(b);

	var method = o.expose();

	strictEqual(method(''), 0, 'Any first test passed');
	strictEqual(method(true), 0, 'Any first test passed');
	strictEqual(method(new Date()), 0, 'Any first test passed');

	strictEqual(method([]), 1, 'Any second test passed');
	strictEqual(method({}), 1, 'Any second test passed');
	strictEqual(method(function() {}), 1, 'Any second test passed');
});

test('except', function() {
	var a = function() { return 0; },
		b = function() { return 1; };

	var o = overload();
	o.err = function() { return 'error'; };
	o.args(o.except(String, Boolean, Date)).use(a);
	o.args(o.except(Array, Object, Function)).use(b);

	var method = o.expose();

	strictEqual(method(''), 1, 'Except first test passed');
	strictEqual(method(true), 1, 'Except first test passed');
	strictEqual(method(new Date()), 1, 'Except first test passed');

	strictEqual(method([]), 0, 'Except second test passed');
	strictEqual(method({}), 0, 'Except second test passed');
	strictEqual(method(function() {}), 0, 'Except second test passed');
});


test('fallback', function() {
	var a = function() { return 0; };

	var o = overload();
	o.args(String, Boolean, Date).use(function() {});
	o.fallback(a);

	var method = o.expose();

	strictEqual(method(), 0, 'Fallback function called');
});

test('passed parameters', function() {
	var a = function(param) { return param; };
	var b = function() { return 'fallback'; };
	var method = overload().args(o.any(String, Number, Boolean)).use(a).fallback(b).expose();

	equal(method('one'), 'one', 'String passed and returned');
	equal(method(2), 2, 'Number passed and returned');
	equal(method(true), true, 'Boolean passed and returned');
	equal(method(null), 'fallback', 'No items matched and defered to the fallback');
});

test('custom', function() {
	overload.defineType('$', function(val) {
		return (val instanceof jQuery);
	});

	ok(o.$, 'Custom type added');

	var a = function() { return 0; };

	var o = overload();
	o.args(o.$).use(a);

	var method1 = o.expose();
	strictEqual(method1($('body')), 0, 'Custom function works as a definition');

	var method2 = overload().args(o.any(Boolean, o.$)).use(a).expose();
	strictEqual(method2($('body')), 0, 'Custom function work inside any() custom definition');
});