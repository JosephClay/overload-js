(function(TRUE, FALSE, NULL, undefined) {

	var root = this;

	// Variablizing the strings for consistency
	// and to avoid harmful dot-notation look-ups with
	// javascript keywords
	var sNull      = 'Null',
		sUndefined = 'Undefined',
		sInfinity  = 'Infinity',
		sDate      = 'Date',
		sNaN       = 'NaN',
		sNumber    = 'Number',
		sString    = 'String',
		sObject    = 'Object',
		sArray     = 'Array',
		sRegExp    = 'RegExp',
		sBoolean   = 'Boolean',
		sFunction  = 'Function',
		sElement   = 'Element';

	// Utilizing the non-standard (but available in modern browsers) Global Object names
	// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
	// Provide a polyfill for items without names
	(function() {
		var globalObjects = [
				sDate,
				sNumber,
				sString,
				sObject,
				sArray,
				sRegExp,
				sBoolean,
				sFunction,
				sElement
			],
			idx = globalObjects.length,
			globalObject;
		while (idx--) {
			globalObject = globalObjects[idx];
			if (root[globalObject] !== undefined) {
				if (!root[globalObject].name) {
					root[globalObject].name = globalObject;
				}
			}
		}
	}());

	/**
	 * Possible values
	 * @type {Object}
	 */
	var _types = {};
	_types[sNull]      = 0;
	_types[sUndefined] = 1;
	_types[sInfinity]  = 2;
	_types[sDate]      = 3;
	_types[sNaN]       = 4;
	_types[sNumber]    = 5;
	_types[sString]    = 6;
	_types[sObject]    = 7;
	_types[sArray]     = 8;
	_types[sRegExp]    = 9;
	_types[sBoolean]   = 10;
	_types[sFunction]  = 11;
	_types[sElement]   = 12;

	/**
	 * Cached reference to Object.prototype.toString
	 * for type checking
	 * @type {Function}
	 */
	var _toString = (function(toString) {
			return function(obj) {
				return toString.call(obj);
			};
		}(({}).toString)),

		_noopArr = [],

		/**
		 * Type checks
		 */
		_checkMap = (function(map) {

			var types = [
					// Only mapping items that need to be mapped.
					// Items not in this list are doing faster
					// (non-string) checks
					//
					// 0 = key, 1 = value
					[ sDate,     _types[sDate]     ],
					[ sNumber,   _types[sNumber]   ],
					[ sString,   _types[sString]   ],
					[ sObject,   _types[sObject]   ],
					[ sArray,    _types[sArray]    ],
					[ sRegExp,   _types[sRegExp]   ],
					[ sFunction, _types[sFunction] ]
				],
				idx = types.length;
			while (idx--) {
				map['[object ' + types[idx][0] + ']'] = types[idx][1];
			}

			return map;

		}({})),

		/**
		 * Mini extend
		 * @param  {Function} base
		 * @param  {Object}   obj
		 * @return {Function} base
		 */
		extend = function(base, obj) {
			var key;
			for (key in obj) {
				base[key] = obj[key];
			}
			return base;
		};

	var callLengths = {
		0: function(fn, args, context) {
			if (!context) { return fn(); }
			return fn.call(context);
		},
		1: function(fn, args, context) {
			return fn.call(context, args[0]);
		},
		2: function(fn, args, context) {
			return fn.call(context, args[0], args[1]);
		},
		3: function(fn, args, context) {
			return fn.call(context, args[0], args[1], args[2]);
		}
	};
	var caller = function(fn, args, context) {
		var call = callLengths[args.length];
		if (call) { return call(fn, args, context); }
		return fn.apply(context, args);
	};

	var _getConfigurationType = function(val) {
		if (val === null) { return _types[sNull]; }
		if (val === undefined) { return _types[sUndefined]; }

		// we have something, but don't know what
		if (!val.name) {
			if (val === root[sElement]) { return _types[sElement]; } // Firefox doesn't allow setting the name of Element
			if (val !== +val) { return _types[sNaN]; } // NaN check
			return _types[sInfinity]; // Infinity check
		}

		return _types[val.name];
	};

	var _getParameterType = function(val) {
		if (val === null) { return _types[sNull]; }
		if (val === undefined) { return _types[sUndefined]; }
		if (val === TRUE || val === FALSE) { return _types[sBoolean]; }
		if (val && val.nodeType === 1) { return _types[sElement]; } // Element check from Underscore

		var typeString = _toString(val);
		if (_checkMap[typeString] === _types[sNumber]) {
			if (val !== +val) { return _types[sNaN]; } // NaN check
			if (!isFinite(val)) { return _types[sInfinity]; } // Finite check
			return _types[sNumber]; // definitely a number
		}

		return _checkMap[typeString];
	};

	var _convertConfigurationTypes = function(args) {
		var parameters = [],
			idx = 0, length = args.length,
			configItem;
		for (; idx < length; idx++) {
			configItem = args[idx];
			parameters.push(
				(configItem instanceof Custom) ? configItem : _getConfigurationType(configItem)
			);
		}
		return parameters;
	};

	var _convertConfigurationMap = function(map) {
		var parameters = {},
			key, configItem;
		for (key in map) {
			configItem = map[key];
			parameters[key] = (configItem instanceof Custom) ? configItem : _getConfigurationType(configItem);
		}
		return parameters;
	};

	var _convertParametersTypes = function(args) {
		var parameters = [],
			idx = 0, length = args.length;
		for (; idx < length; idx++) {
			parameters.push(_getParameterType(args[idx]));
		}
		return parameters;
	};

	var _doesMapMatchArgsTypes = function(map, argTypes, args) {
		var mapLength = map.length,
			argLength = argTypes.length;

		if (mapLength === 0 && argLength === 0) { return TRUE; }
		if (mapLength !== argLength) { return FALSE; }

		var idx = 0,
			mapItem;
		for (; idx < argLength; idx++) {
			mapItem = map[idx];

			if (mapItem instanceof Custom) {
				if (mapItem.check(args[idx])) {
					continue;
				}
				return FALSE;
			}

			if (argTypes[idx] !== mapItem) {
				return FALSE;
			}
		}

		return TRUE;
	};

	var _getArgumentMatch = function(mappings, args) {
		if (!mappings) { return; }

		var argTypes = _convertParametersTypes(args),
			idx = 0, length = mappings.length;
		for (; idx < length; idx++) {
			if (_doesMapMatchArgsTypes(mappings[idx].params, argTypes, args)) {
				return mappings[idx];
			}
		}
	};

	var _getLengthMatch = function(mappings, args) {
		if (!mappings) { return; }

		var argLength = args.length,
			idx = 0, length = mappings.length;
		for (; idx < length; idx++) {
			if (mappings[idx].length === argLength) {
				return mappings[idx];
			}
		}
	};

	var _matchAny = function(args, val) {
		var type = _getParameterType(val),
			idx = args.length,
			mapItem;

		while (idx--) {
			mapItem = args[idx];

			if (mapItem instanceof Custom) {
				if (mapItem.check(val)) {
					return TRUE;
				}
				continue;
			}

			if (args[idx] === type) {
				return TRUE;
			}
		}

		return FALSE;
	};

	var _matchMap = function(config, map) {
		var key, configItem, mapItem;
		for (key in config) {
			configItem = config[key];
			mapItem = map[key];

			if (configItem instanceof Custom) {
				if (!configItem.check(mapItem)) {
					return FALSE;
				}
				continue;
			}

			if (configItem !== _getParameterType(mapItem)) {
				return FALSE;
			}
		}

		return TRUE;
	};

	/**
	 * Custom type that validates a value
	 * @constructor
	 * @param {Function} check
	 */
	var Custom = function(check) {
		this.check = check;
	};

	var o = {
		wild: new Custom(function() {
			return TRUE;
		}),
		truthy: new Custom(function(val) {
			return !!val === TRUE;
		}),
		falsy: new Custom(function(val) {
			return !!val === FALSE;
		}),
		any: function() {
			var args = _convertConfigurationTypes(arguments);
			return new Custom(function(val) {
				return _matchAny(args, val);
			});
		},
		except: function() {
			var args = _convertConfigurationTypes(arguments);
			return new Custom(function(val) {
				return !_matchAny(args, val);
			});
		},
		map: function(map) {
			var mapConfig = _convertConfigurationMap(map);
			return new Custom(function(map) {
				return _matchMap(mapConfig, map);
			});	
		}
	};

	var fn = {
		/**
		 * Methods mapped to argument types
		 * Lazily instanciated
		 * @type {Array} argument mapping
		 */
		// this._m;

		/**
		 * Methods mapped to argument lengths
		 * Lazily instanciated
		 * @type {Array} length mapping
		 */
		// this._l;

		/**
		 * A fallback function if none
		 * of the criteria match on a call
		 * @type {Function}
		 */
		// this._f;

		map: function(map) {
			var self = this;

			return {
				use: function(method) {
					var argMappings = self._m || (self._m = []);
					argMappings.push({
						params: [o.map(map)],
						method: method
					});
					return self;
				}
			};
		},

		args: function() {
			var self = this,
				args = arguments;

			return {
				use: function(method) {
					var argMappings = self._m || (self._m = []);
					argMappings.push({
						params: _convertConfigurationTypes(args),
						method: method
					});
					return self;
				}
			};
		},

		len: function(num) {
			var self = this;
			return {
				use: function(method) {
					var lengthMappings = self._l || (self._l = []);
					lengthMappings.push({
						length: (num === undefined) ? method.length : num,
						method: method
					});
					return self;
				}
			};
		},

		error: function(method) {
			this._err = method;
			return this;
		},

		fallback: function(method) {
			this._f = method;
			return this;
		},

		call: function() {
			// prevent function deoptimation
			var args = arguments, a = [];
			for (var idx = 1, length = args.length; idx < length; idx++) {
				a[idx] = args[idx];
			}
			return this._call(args[0], a);
		},

		apply: function(context, args) {
			var a = args;
			if (args && args.callee)  {
				// passed an arguments object,
				// not an array.
				// prevent function deoptimation
				a = [];
				for (var idx = 0, length = args.length; idx < length; idx++) {
					a[idx] = args[idx];
				}
			}
			return this._call(context, a);
		},

		bind: function(context) {
			var self = this;
			return function() {
				// prevent function deoptimation
				var args = arguments, a = [];
				for (var idx = 0, length = args.length; idx < length; idx++) {
					a[idx] = args[idx];
				}
				return self._call(context, a);
			};
		},

		expose: function() {
			var self = this;
			return function() {
				// prevent function deoptimation
				var args = arguments, a = [];
				for (var idx = 0, length = args.length; idx < length; idx++) {
					a[idx] = args[idx];
				}

				return self._call(this, a);
			};
		},

		_call: function(context, args) {
			if (context === root) { context = null; }

			args = args || _noopArr;

			// Any argument match, of course, already matches
			// the length match, so this should be done first
			var argMatch = _getArgumentMatch(this._m, args);
			if (argMatch) {
				return caller(argMatch.method, args, context);
			}

			// Check for a length match
			var lengthMatch = _getLengthMatch(this._l, args);
			if (lengthMatch) {
				return caller(lengthMatch.method, args, context);
			}

			// Check for a fallback
			if (this._f) {
				return caller(this._f, args, context);
			}

			// Error
			return this._err ? this._err(args) : api.err;
		}
	};

	fn.fail = fn.err = fn.error;
	fn.count = fn.size = fn.len;

	var api = function() {
		var overload = function overload() {
			return overload._call(overload, arguments);
		};
		return extend(overload, fn);
	};
	api.o = o;
	api.fn = fn;
	api.err = function() {
		throw 'overload - exception: No methods matched';
	};
	api.define = api.defineType = function(name, check) {
		var custom = new Custom(check);
		return (o[name] = custom);
	};
	api.defineTypes = function(obj) {
		var key;
		for (key in obj) {
			api.define(key, obj[key]);
		}
		return api;
	};

	if (typeof define === 'function') { // RequireJS
        define(function() { return api; });
    }  else if (typeof module !== 'undefined' && module.exports) { // CommonJS
        module.exports = api;
    } else {
		root.overload = api;
		root.o = o;
    }

}(true, false, null));
