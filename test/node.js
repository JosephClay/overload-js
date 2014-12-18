var _ = require('underscore'),
	overload = require('../overload'),
	o = overload.o;

module.exports = {
	basics: function(test) {
		test.ok(overload, 'overload exists');
		test.ok(overload(), 'overload object created');
		test.ok(typeof overload() === 'function', 'overload object is a function');

		test.ok(o, 'o exists');
		test.ok(o.any, 'o.any exists');
		test.ok(o.truthy, 'o.truthy exists');
		test.ok(o.falsy, 'o.falsy exists');

		test.done();
	},

	method_registration: function(test) {
		var a = function() { return false; },
			b = function() { return true; };

		var o = overload()
			.args().use(a);

		test.ok(o, 'Exposed as a is a function');
		test.strictEqual(o(), false, 'Method registered and called');
		test.strictEqual(o(), false, 'Method returns return value');
		test.strictEqual(o(), false, 'overload can be used without arguments');

		test.done();
	},

	overload_paths: function(test) {
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
			.args(Function).use(function() { return Function; });

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
			}
		];

		var idx = types.length;
		while (idx--) {
			var type = types[idx];
			test.strictEqual(method(type.param), type.type, type.name + ' passed overload test');
		}

		// NaN is special because NaN !== NaN
		test.strictEqual(_.isNaN(method(NaN)), _.isNaN(NaN), 'NaN passed overload test');

		test.done();
	},

	this_context: function(test) {
		var method = overload()
			.args()
			.use(function() { return this; });

		test.equal(method.call('one'), 'one', 'Exposed method can be called with context');
		test.equal(method.apply('two'), 'two', 'Exposed method can be applied with context');
		test.equal(method.bind('three')(), 'three', 'Exposed method can be bound with context');

		test.done();
	},

	wild: function(test) {
		var method = overload()
			.error(function() { return 'error'; })
			.args(o.wild).use(function() { return true; });

		test.strictEqual(method(1), true, 'wild works with #1');
		test.strictEqual(method(0), true, 'wild works with #0');
		test.strictEqual(method(true), true, 'wild works with true');
		test.strictEqual(method(false), true, 'wild works with false');
		test.strictEqual(method('1'), true, 'wild works with "1"');
		test.strictEqual(method({}), true, 'wild works with Object');
		test.strictEqual(method([]), true, 'wild works with Array');
		test.strictEqual(method(undefined), true, 'wild works with undefined');
		test.strictEqual(method(null), true, 'wild works with null');
		test.strictEqual(method(), 'error', 'wild throws error with no param');

		test.done();
	},

	truthy: function(test) {
		var method = overload()
			.error(function() { return 'error'; })
			.args(o.truthy).use(function() { return true; });

		test.strictEqual(method(1), true, 'truthy works with #1');
		test.strictEqual(method(true), true, 'truthy works with true');
		test.strictEqual(method('1'), true, 'truthy works with "1"');
		test.strictEqual(method({}), true, 'truthy works with Object');
		test.strictEqual(method([]), true, 'truthy works with Array');
		test.strictEqual(method(0), 'error', 'truthy throws error with falsy value');

		test.done();
	},

	falsy: function(test) {
		var method = overload()
			.error(function() { return 'error'; })
			.args(o.falsy).use(function() { return false; });

		test.strictEqual(method(0), false, 'falsy works with #0');
		test.strictEqual(method(false), false, 'falsy works with false');
		test.strictEqual(method(''), false, 'falsy works with ""');
		test.strictEqual(method(null), false, 'falsy works with null');
		test.strictEqual(method(undefined), false, 'falsy works with undefined');
		test.strictEqual(method(1), 'error', 'falsy throws error with truthy value');

		test.done();
	},

	length: function(test) {
		var a = function() { return 1; },
			b = function() { return 2; },
			c = function() { return 3; };

		var method = overload()
			.len(0).use(a)
			.len(1).use(b)
			.len(2).use(c);

		test.strictEqual(method(), 1, 'No params called first function');
		test.strictEqual(method(1), 2, 'One param called second function');
		test.strictEqual(method(1, 2), 3, 'Two params called third function');

		var method2 = overload()
			.len().use(function(a, b, c, d) { return 4; });

		test.strictEqual(method2(1, 2, 3, 4), 4, 'No length gets length from function');

		test.done();
	},

	any: function(test) {
		var method = overload()
			.error(function() { return 'error'; })
			.args(o.any(String, Boolean, Date)).use(function() { return 0; })
			.args(o.any(Array, Object, Function)).use(function() { return 1; });

		test.strictEqual(method(''), 0, 'Any first test passed');
		test.strictEqual(method(true), 0, 'Any first test passed');
		test.strictEqual(method(new Date()), 0, 'Any first test passed');

		test.strictEqual(method([]), 1, 'Any second test passed');
		test.strictEqual(method({}), 1, 'Any second test passed');
		test.strictEqual(method(function() {}), 1, 'Any second test passed');

		test.done();
	},

	except: function(test) {
		var method = overload()
			.error(function() { return 'error'; })
			.args(o.except(String, Boolean, Date)).use(function() { return 0; })
			.args(o.except(Array, Object, Function)).use(function() { return 1; });

		test.strictEqual(method(''), 1, 'Expect first test passed');
		test.strictEqual(method(true), 1, 'Expect first test passed');
		test.strictEqual(method(new Date()), 1, 'Expect first test passed');

		test.strictEqual(method([]), 0, 'Expect second test passed');
		test.strictEqual(method({}), 0, 'Expect second test passed');
		test.strictEqual(method(function() {}), 0, 'Expect second test passed');

		test.done();
	},

	map: function(test) {
		var a = function() { return true; };

		var method = overload()
			.error(function() { return 'error'; })
			.args(o.map({ foo: String, bar: Boolean, baz: Date })).use(a);

		test.strictEqual(method(''), 'error', 'Expect error');
		test.strictEqual(method(true), 'error', 'Expect error');
		test.strictEqual(method(new Date()), 'error', 'Expect error');
		
		test.strictEqual(method({ foo: '', bar: false }), 'error', 'Expect error - missing bar');
		test.strictEqual(method({ foo: '', baz: new Date() }), 'error', 'Expect error - missing baz');
		test.strictEqual(method({ bar: false, baz: new Date() }), 'error', 'Expect error - missing foo');
		
		test.strictEqual(method({ foo: '', bar: false, baz: new Date() }), true, 'Expect pass - fulfilled requirements');
		test.strictEqual(method({ foo: '', bar: false, baz: new Date(), foo2: '' }), true, 'Expect pass - extra data ignored');

		// reset for undefined key test
		method = overload()
			.error(function() { return 'error'; })
			.args(o.map({ foo: undefined, bar: Boolean })).use(a);

		test.strictEqual(method({ bar: false }), true, 'Expect pass - missing key that should be undefined is ignored');

		// reset for convenience method
		method = overload()
			.error(function() { return 'error'; })
			.map({ foo: String, bar: Boolean, baz: Date }).use(a);

		test.strictEqual(method(''), 'error', 'Expect error');
		test.strictEqual(method(true), 'error', 'Expect error');
		test.strictEqual(method(new Date()), 'error', 'Expect error');
		
		test.strictEqual(method({ foo: '', bar: false }), 'error', 'Expect error - missing bar');
		test.strictEqual(method({ foo: '', baz: new Date() }), 'error', 'Expect error - missing baz');
		test.strictEqual(method({ bar: false, baz: new Date() }), 'error', 'Expect error - missing foo');
		
		test.strictEqual(method({ foo: '', bar: false, baz: new Date() }), true, 'Expect pass - fulfilled requirements');
		test.strictEqual(method({ foo: '', bar: false, baz: new Date(), foo2: '' }), true, 'Expect pass - extra data ignored');

		test.done();
	},

	fallback: function(test) {
		var method = overload()
			.args(String).use(function() {})
			.fallback(function() { return 0; });

		test.strictEqual(method(), 0, 'Fallback function called');

		test.done();
	},

	error: function(test) {
		var method = overload()
			.args(String).use(function() { return 0; })
			.error(function() { return 'error'; });

		test.strictEqual(!!method, true, '.error successfully chains');
		test.strictEqual(method(''), 0, '.error chained succeeds');
		test.strictEqual(method(), 'error', '.error chained fails');

		test.done();
	},

	expose: function(test) {
		var method = overload()
			.args(String).use(function() { return 0; })
			.error(function() { return 'error'; })
			.expose();

		test.strictEqual(method(''), 0, 'Exposed function suceeds');
		test.strictEqual(method(), 'error', 'Exposed function fails');
		test.strictEqual(method.args, undefined, 'Exposed function is clean');

		test.done();
	},

	passed_parameters: function(test) {
		var method = overload()
			.args(o.any(String, Number, Boolean)).use(function(param) { return param; })
			.fallback(function() { return 'fallback'; });

		test.equal(method('one'), 'one', 'String passed and returned');
		test.equal(method(2), 2, 'Number passed and returned');
		test.equal(method(true), true, 'Boolean passed and returned');
		test.equal(method(null), 'fallback', 'No items matched and defered to the fallback');

		test.done();
	},

	custom: function(test) {
		var Thingy = function() {};
		overload.defineType('thingy', function(val) {
			return (val instanceof Thingy);
		});

		test.ok(o.thingy, 'Custom type added');

		var a = function() { return 0; };

		var method1 = overload().args(o.thingy).use(a);
		test.strictEqual(method1(new Thingy()), 0, 'Custom function works as a definition');

		var method2 = overload().args(o.any(Boolean, o.thingy)).use(a);
		test.strictEqual(method2(new Thingy()), 0, 'Custom function work inside any() custom definition');

		test.done();
	}
};