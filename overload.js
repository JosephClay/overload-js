(function(root, undefined) {

		/**
		 * Cached reference to Object.prototype.toString
		 * for type checking
		 * @type {Function}
		 */
	var _toString = Object.prototype.toString;

		/**
		 * Type checks
		 * @return {Function{}}
		 */
		_check = (function() {

			var checks = {},
				types = ['Function', 'String', 'Number', 'Date', 'RegExp', 'Array'],
				idx = types.length;
			while (idx--) {
				checks[types[idx].toLowerCase()] = (function(name) {
					return function(obj) {
						return _toString.call(obj) === '[object ' + name + ']';
					};	
				}(types[idx]));
			}

			checks.array = Array.isArray || checks.array;

			checks.element = function(obj) {
				return !!(obj && obj.nodeType === 1);
			};

			return checks;

		}()),

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

		if (_check.number(val)) {
			if (val !== +val) { return _types['NaN']; } // NaN check
			if (!isFinite(val)) { return _types['Infinity']; } // Finite check
			return _types['Number']; // definitely a number
		}

		if (_check.string(val)) { return _types['String']; }
		if (_check.function(val)) { return _types['Function']; }
		if (_check.array(val)) { return _types['Array']; }
		if (_check.regexp(val)) { return _types['RegExp']; }
		if (_check.date(val)) { return _types['Date']; }
		if (_check.element(val)) { return _types['Element']; }
		
		// Nothing else matches, it's a plain object
		return _types['Object'];
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
			idx = args.length;

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