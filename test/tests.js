test('basics', function() {
	ok(overload, 'overload exists');
	ok(overload(), 'overload object created');
	ok(typeof overload() === 'function', 'overload object is a function');

	ok(o, 'o exists');
	ok(o.any, 'o.any exists');
	ok(o.truthy, 'o.truthy exists');
	ok(o.falsy, 'o.falsy exists');
});

test('method registration', function() {
	var a = function() { return false; },
		b = function() { return true; };

	var o = overload()
		.args().use(a)

	ok(_.isFunction(o), 'Exposed as a is a function');
	strictEqual(o(), false, 'Method registered and called');
	strictEqual(o(), false, 'Method returns return value');
	strictEqual(o(), false, 'overload can be used without arguments');
});

test('overload paths', function() {
	var method = overload()
		.args(null).use(function() { return null; })
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
	var method = overload()
		.args()
		.use(function() { return this; });

	equal(method.call('one'), 'one', 'Exposed method can be called with context');
	equal(method.apply('two'), 'two', 'Exposed method can be applied with context');
	equal(method.bind('three')(), 'three', 'Exposed method can be bound with context');
});

test('wild', function() {
	var method = overload()
		.error(function() { return 'error'; })
		.args(o.wild).use(function() { return true; });

	strictEqual(method(1), true, 'wild works with #1');
	strictEqual(method(0), true, 'wild works with #0');
	strictEqual(method(true), true, 'wild works with true');
	strictEqual(method(false), true, 'wild works with false');
	strictEqual(method('1'), true, 'wild works with "1"');
	strictEqual(method({}), true, 'wild works with Object');
	strictEqual(method([]), true, 'wild works with Array');
	strictEqual(method(undefined), true, 'wild works with undefined');
	strictEqual(method(null), true, 'wild works with null');
	strictEqual(method(), 'error', 'wild throws error with no param');
});

test('truthy', function() {
	var method = overload()
		.error(function() { return 'error'; })
		.args(o.truthy).use(function() { return true; });

	strictEqual(method(1), true, 'truthy works with #1');
	strictEqual(method(true), true, 'truthy works with true');
	strictEqual(method('1'), true, 'truthy works with "1"');
	strictEqual(method({}), true, 'truthy works with Object');
	strictEqual(method([]), true, 'truthy works with Array');
	strictEqual(method(0), 'error', 'truthy throws error with falsy value');
});

test('falsy', function() {
	var method = overload()
		.error(function() { return 'error'; })
		.args(o.falsy).use(function() { return false; });

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

	var method = overload()
		.len(0).use(a)
		.len(1).use(b)
		.len(2).use(c);

	strictEqual(method(), 1, 'No params called first function');
	strictEqual(method(1), 2, 'One param called second function');
	strictEqual(method(1, 2), 3, 'Two params called third function');

	var method2 = overload()
		.len().use(function(a, b, c, d) { return 4; });

	strictEqual(method2(1, 2, 3, 4), 4, 'No length gets length from function');
});

test('any', function() {
	var method = overload()
		.error(function() { return 'error'; })
		.args(o.any(String, Boolean, Date)).use(function() { return 0; })
		.args(o.any(Array, Object, Function)).use(function() { return 1; });

	strictEqual(method(''), 0, 'Any first test passed');
	strictEqual(method(true), 0, 'Any first test passed');
	strictEqual(method(new Date()), 0, 'Any first test passed');

	strictEqual(method([]), 1, 'Any second test passed');
	strictEqual(method({}), 1, 'Any second test passed');
	strictEqual(method(function() {}), 1, 'Any second test passed');
});

test('except', function() {
	var method = overload()
		.error(function() { return 'error'; })
		.args(o.except(String, Boolean, Date)).use(function() { return 0; })
		.args(o.except(Array, Object, Function)).use(function() { return 1; });

	strictEqual(method(''), 1, 'Expect first test passed');
	strictEqual(method(true), 1, 'Expect first test passed');
	strictEqual(method(new Date()), 1, 'Expect first test passed');

	strictEqual(method([]), 0, 'Expect second test passed');
	strictEqual(method({}), 0, 'Expect second test passed');
	strictEqual(method(function() {}), 0, 'Expect second test passed');
});

test('map', function() {
	var a = function() { return true; };

	var method = overload()
		.error(function() { return 'error'; })
		.args(o.map({ foo: String, bar: Boolean, baz: Date })).use(a);

	strictEqual(method(''), 'error', 'Expect error');
	strictEqual(method(true), 'error', 'Expect error');
	strictEqual(method(new Date()), 'error', 'Expect error');
	
	strictEqual(method({ foo: '', bar: false }), 'error', 'Expect error - missing bar');
	strictEqual(method({ foo: '', baz: new Date() }), 'error', 'Expect error - missing baz');
	strictEqual(method({ bar: false, baz: new Date() }), 'error', 'Expect error - missing foo');
	
	strictEqual(method({ foo: '', bar: false, baz: new Date() }), true, 'Expect pass - fulfilled requirements');
	strictEqual(method({ foo: '', bar: false, baz: new Date(), foo2: '' }), true, 'Expect pass - extra data ignored');

	// reset for undefined key test
	method = overload()
		.error(function() { return 'error'; })
		.args(o.map({ foo: undefined, bar: Boolean })).use(a);

	strictEqual(method({ bar: false }), true, 'Expect pass - missing key that should be undefined is ignored');

	// reset for convenience method
	method = overload()
		.error(function() { return 'error'; })
		.map({ foo: String, bar: Boolean, baz: Date }).use(a);

	strictEqual(method(''), 'error', 'Expect error');
	strictEqual(method(true), 'error', 'Expect error');
	strictEqual(method(new Date()), 'error', 'Expect error');
	
	strictEqual(method({ foo: '', bar: false }), 'error', 'Expect error - missing bar');
	strictEqual(method({ foo: '', baz: new Date() }), 'error', 'Expect error - missing baz');
	strictEqual(method({ bar: false, baz: new Date() }), 'error', 'Expect error - missing foo');
	
	strictEqual(method({ foo: '', bar: false, baz: new Date() }), true, 'Expect pass - fulfilled requirements');
	strictEqual(method({ foo: '', bar: false, baz: new Date(), foo2: '' }), true, 'Expect pass - extra data ignored');
});

test('fallback', function() {
	var method = overload()
		.args(String).use(function() {})
		.fallback(function() { return 0; });

	strictEqual(method(), 0, 'Fallback function called');
});

test('error', function() {
	var method = overload()
		.args(String).use(function() { return 0; })
		.error(function() { return 'error'; });

	strictEqual(!!method, true, '.error successfully chains');
	strictEqual(method(''), 0, '.error chained succeeds');
	strictEqual(method(), 'error', '.error chained fails');
});

test('expose', function() {
	var method = overload()
		.args(String).use(function() { return 0; })
		.error(function() { return 'error'; })
		.expose();

	strictEqual(method(''), 0, 'Exposed function suceeds');
	strictEqual(method(), 'error', 'Exposed function fails');
	strictEqual(method.args, undefined, 'Exposed function is clean');
});

test('passed parameters', function() {
	var method = overload()
		.args(o.any(String, Number, Boolean)).use(function(param) { return param; })
		.fallback(function() { return 'fallback'; });

	equal(method('one'), 'one', 'String passed and returned');
	equal(method(2), 2, 'Number passed and returned');
	equal(method(true), true, 'Boolean passed and returned');
	equal(method(null), 'fallback', 'No items matched and defered to the fallback');
});

test('custom', function() {
	var Thingy = function() {};
	overload.defineType('thingy', function(val) {
		return (val instanceof Thingy);
	});

	ok(o.thingy, 'Custom type added');

	var a = function() { return 0; };

	var method1 = overload().args(o.thingy).use(a);
	strictEqual(method1(new Thingy()), 0, 'Custom function works as a definition');

	var method2 = overload().args(o.any(Boolean, o.thingy)).use(a);
	strictEqual(method2(new Thingy()), 0, 'Custom function work inside any() custom definition');
});