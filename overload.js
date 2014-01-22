(function(root, undefined) {

		/**
		 * Cached reference to Object.prototype.toString
		 * for type checking
		 * @type {Function}
		 */
	var _toString = (function(toString) {
			return function(obj) {
				return toString.call(obj);
			};
		}(Object.prototype.toString)),

		/**
		 * Type checks
		 */
		_checkMap = (function() {

			var map = {},
				types = [
					// Only mapping items that need to be mapped.
					// Items not in this list are doing faster
					// (non-string) checks
					{ key: 'Date',     val: 3 },
					{ key: 'Number',   val: 5 },
					{ key: 'String',   val: 6 },
					{ key: 'Object',   val: 7 },
					{ key: 'Array',    val: 8 },
					{ key: 'RegExp',   val: 9 },
					{ key: 'Function', val: 11 }
				],
				idx = types.length;
			while (idx--) {
				map['[object ' + types[idx].key + ']'] = types[idx].val;
			}

			return map;

		}()),

		/**
		 * Element check from Underscore
		 * @param  {Value}  obj
		 * @return {Boolean}
		 */
		_isElement = function(obj) {
			return !!(obj && obj.nodeType === 1);
		},

		/**
		 * Changes arguments to an array
		 * @param  {Arguments} arraylike
		 * @return {Array}
		 */
		_toArray = function(arraylike) {
			var arr = [],
				idx = 0, length = arraylike.length;
			for (; idx < length; idx++) {
				arr[idx] = arraylike[idx];
			}
			return arr;
		},

		/**
		 * Possible values
		 * @type {Object}
		 */
		_types = {
			'null': 0,
			'undefined': 1,
			'Infinity': 2,
			'Date': 3,
			'NaN': 4,
			'Number': 5,
			'String': 6,
			'Object': 7,
			'Array': 8,
			'RegExp': 9,
			'Boolean': 10,
			'Function': 11,
			'Element': 12
		};

	var _getConfigurationType = function(val) {
		if (val === null) { return _types['null']; }
		if (val === undefined) { return _types['undefined']; }

		// we have something, but don't know what
		if (val.name === undefined) {
			if (val !== +val) { return _types['NaN']; } // NaN check
			return _types['Infinity']; // Infinity check
		}

		return _types[val.name];
	};

	var _getParameterType = function(val) {
		if (val === null) { return _types['null']; }
		if (val === undefined) { return _types['undefined']; }
		if (val === true || val === false) { return _types['Boolean']; }
		if (_isElement(val)) { return _types['Element']; }

		var typeString = _toString(val);
		if (_checkMap[typeString] === _types['Number']) {
			if (val !== +val) { return _types['NaN']; } // NaN check
			if (!isFinite(val)) { return _types['Infinity']; } // Finite check
			return _types['Number']; // definitely a number
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

		if (mapLength === 0 && argLength === 0) { return true; }
		if (mapLength !== argLength) { return false; }

		var idx = 0,
			mapItem;
		for (; idx < argLength; idx++) {
			mapItem = map[idx];

			if (mapItem instanceof Custom) {
				if (mapItem.check(args[idx])) {
					continue;
				} else {
					return false;
				}
			}

			if (argTypes[idx] !== mapItem) {
				return false;
			}
		}

		return true;
	};

	var _getArgumentMatch = function(mappings, args) {
		mappings = mappings || [];

		var argTypes = _convertParametersTypes(args),
			idx = 0, length = mappings.length;
		for (; idx < length; idx++) {
			if (_doesMapMatchArgsTypes(mappings[idx].params, argTypes, args)) {
				return mappings[idx];
			}
		}

		return null;
	};

	var _getLengthMatch = function(mappings, args) {
		mappings = mappings || [];

		var argLength = args.length,
			idx = 0, length = mappings.length;
		for (; idx < length; idx++) {
			if (mappings[idx].length === argLength) {
				return mappings[idx];
			}
		}

		return null;
	};

	var _matchAny = function(args, val) {
		var type = _getParameterType(val),
			idx = args.length,
			mapItem;

		while (idx--) {
			mapItem = args[idx];

			if (mapItem instanceof Custom) {
				if (mapItem.check(args[idx])) {
					return true;
				} else {
					return false;
				}
			}

			if (args[idx] === type) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Custom type that validates a value
	 * @constructor
	 * @param {Function} check
	 */
	var Custom = function(check) {
		this.check = check;
	};

	var O = {
		truthy: new Custom(function(val) {
			return (!!val) === true;
		}),
		falsy: new Custom(function(val) {
			return (!!val) === false;
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
		}
	};

	/**
	 * @constructor
	 */
	var Overload = function() {
		/**
		 * Methods mapped to argument types
		 * Lazily instanciated
		 * @type {Array}
		 */
		this._argMappings = null;
		
		/**
		 * Methods mapped to argument lengths
		 * Lazily instanciated
		 * @type {Array}
		 */
		this._lengthMappings = null;

		/**
		 * A fallback function if none
		 * of the criteria match on a call
		 * @type {Function}
		 */
		this._fallback = null;
	};

	Overload.defineType = function(name, check) {
		var custom = new Custom(check);
		return (O[name] = custom);
	};

	Overload.prototype = {

		/** @constructor */
		constructor: Overload,

		args: function() {
			var self = this,
				args = arguments;

			return {
				use: function(method) {
					var argMappings = self._argMappings || (self._argMappings = []);
					argMappings.push({
						params: _convertConfigurationTypes(args),
						method: method
					});
					return self;
				}
			};
		},

		length: function(num) {
			var self = this;
			return {
				use: function(method) {
					var lengthMappings = self._lengthMappings || (self._lengthMappings = []);
					lengthMappings.push({
						length: (num === undefined) ? method.length : num,
						method: method
					});
					return self;
				}
			};
		},

		err: function(args) {
			throw new Error('No methods matched arguments: ', args, this);
		},

		fallback: function(method) {
			this._fallback = method;
		},

		call: function() {
			var args = _toArray(arguments);
			return this._call(args.shift(), args);
		},

		apply: function(context, args) {
			return this._call(context, args);
		},

		bind: function(context) {
			var self = this;
			return function() {
				return self._call(context, arguments);
			}.bind(context);
		},

		expose: function() {
			var self = this;
			return function() {
				return self._call(this, arguments);
			};
		},

		_call: function(context, args) {
			args = args || [];

			// Any argument match, of course, already matches
			// the length match, so this should be done first
			var argMatch = _getArgumentMatch(this._argMappings, args);
			if (argMatch) {
				return argMatch.method.apply(context, args);
			}

			// Check for a length match
			var lengthMatch = _getLengthMatch(this._lengthMappings, args);
			if (lengthMatch) {
				return lengthMatch.method.apply(context, args);
			}

			// Check for a fallback
			if (this._fallback) {
				return this._fallback.apply(context, args);
			}

			// Error
			return this.err(args);
		}
	};

	root.Overload = Overload;
	root.O = O;

}(this));