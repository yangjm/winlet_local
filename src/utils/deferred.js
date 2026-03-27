/**
 * Thin Deferred wrapper over native Promise.
 * Provides .resolve(), .reject(), .promise(), .done(), .fail()
 * for backward compatibility with jQuery Deferred patterns.
 */
export function Deferred() {
	var _resolve, _reject;

	var p = new Promise(function(resolve, reject) {
		_resolve = resolve;
		_reject = reject;
	});

	// Add .done() and .fail() aliases on the promise
	p.done = function(fn) {
		p.then(fn);
		return p;
	};
	p.fail = function(fn) {
		p.catch(fn);
		return p;
	};

	var dfd = {
		promise: function() { return p; },
		resolve: function(val) {
			_resolve(val);
			return dfd;
		},
		reject: function(val) {
			_reject(val);
			return dfd;
		},
		done: function(fn) {
			p.then(fn);
			return dfd;
		}
	};

	return dfd;
}

/**
 * Replaces $.when.apply($, arr)
 * Returns a promise with .done() and .fail() aliases.
 */
export function whenAll(arr) {
	var p = Promise.all(arr);
	p.done = function(fn) {
		p.then(fn);
		return p;
	};
	p.fail = function(fn) {
		p.catch(fn);
		return p;
	};
	return p;
}
