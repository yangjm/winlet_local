import { WinletJSEngine } from './core.js';
import { deparam } from '../utils/deparam.js';
import { param } from '../utils/param.js';
import { qs } from '../utils/dom.js';

WinletJSEngine.getWinletUrl = function(container, url) {
	if (url && !url.indexOf("/") == 0)
		url = "/" + url;

	var pathLevel = url == null ? 0 : (url.match(/\//g) || []).length;
	if (pathLevel == 3)
		return url;

	var winlet = WinletJSEngine.traceToWinlet(container);
	if (winlet == null)
		return null;

	if (!url)
		return winlet.getAttribute("data-winlet-url");

	switch (pathLevel) {
		case 1:
			return WinletJSEngine.getWinletRoot(winlet) + url.substring(1);
		case 2:
			return WinletJSEngine.getContextRoot(winlet) + url.substring(1);
	}
	return url;
};

WinletJSEngine.getWinletRoot = function(container) {
	try {
		var url = WinletJSEngine.getWinletUrl(container);
		if (WinletJSEngine.winletRootMap[url] == null)
			WinletJSEngine.winletRootMap[url] = url.match(WinletJSEngine.reWinlet)[2];
		return WinletJSEngine.winletRootMap[url];
	} catch {
		return null;
	}
};

WinletJSEngine.getContextRoot = function(container) {
	try {
		var url = WinletJSEngine.getWinletUrl(container);
		if (WinletJSEngine.contextRootMap[url] == null) {
			WinletJSEngine.contextRootMap[url] = url.match(WinletJSEngine.reWinlet)[3];
			if (WinletJSEngine.contextRootMap[url] == null)
				WinletJSEngine.contextRootMap[url] = "/";
			else
				WinletJSEngine.contextRootMap[url] = WinletJSEngine.contextRootMap[url] + "/";
		}
		return WinletJSEngine.contextRootMap[url];
	} catch {
		return null;
	}
};

WinletJSEngine.getHashGroup = function(container) {
	try {
		var url = WinletJSEngine.getWinletRoot(container);

		var parent = container.parentElement ? container.parentElement.closest("div[data-winlet-url]") : null;
		while(parent != null && WinletJSEngine.getWinletRoot(parent) == url) {
			container = parent;
			parent = container.parentElement ? container.parentElement.closest("div[data-winlet-url]") : null;
		}

		var ext = container.closest("[data-winlet-hashgroup-ext]");
		var extVal = "";
		if (ext != null) {
			extVal = ext.getAttribute("data-winlet-hashgroup-ext");
			url = url + "!" + extVal;
		}

		if (WinletJSEngine.hashGroupMap[url] == null) {
			var settings = WinletJSEngine.getWinSettings(container);
			if ('yes' == settings['root'])
				WinletJSEngine.hashGroupMap[url] = 'root';
			else {
				var count = 0;
				for (var k in WinletJSEngine.hashGroupMap) {
					if (WinletJSEngine.hashGroupMap.hasOwnProperty(k))
						++count;
				}
				WinletJSEngine.hashGroupMap[url] = (count + 1).toString() + extVal;
			}
		}
		return WinletJSEngine.hashGroupMap[url];
	} catch {
		return null;
	}
};

WinletJSEngine.getFullUrl = function(url) {
	if (WinletJSEngine.winletDomain) {
		var sid = WinletJSEngine.getSessionId();
		if (sid == null)
			return WinletJSEngine.winletDomain + url;

		var idx = url.indexOf("?");
		if (idx <= 0)
			return WinletJSEngine.winletDomain + url + ";jsessionid=" + sid;

		return WinletJSEngine.winletDomain + url.substr(0, idx) + ";jsessionid=" + sid + url.substr(idx);
	}
	return url;
};

WinletJSEngine.getWinSettings = function(container) {
	var winlet = WinletJSEngine.traceToWinlet(container);
	if (winlet == null)
		return {};
	var settings = winlet.dataset.winletSettings;
	if (settings == null)
		return {};
	if (typeof settings == 'string' || settings instanceof String)
		return WinletJSEngine.parseJson(settings);
	return settings;
};

WinletJSEngine.getHash = function(container) {
	var hashgroup = WinletJSEngine.getHashGroup(container);

	try {
		var hash = window.location.toString().split('#')[1];
		if (hash.indexOf("!") == 0)
			hash = hash.substring(1);
		var params = deparam(hash);

		if ('root' == hashgroup) {
			var ret = {};
			for (var p in params) {
				var include = true;
				if (!params.hasOwnProperty(p))
					include = false;

				if (include && typeof params[p] === 'object') {
					if (Object.prototype.toString.call(params[p]) !== '[object Array]')
						include = false;
					else {
						for (var i = 0; i < params[p].length; i++)
							if (typeof params[p][i] != 'string' && typeof params[p][i] != 'number') {
								include = false;
								break;
							}
					}
				}
				if (include) ret[p] = params[p];
			}
			return ret;
		} else
			return params[hashgroup];
	} catch {}
	return null;
};

WinletJSEngine.setHash = function(container, hash, toggle, replace) {
	var hashgroup = WinletJSEngine.getHashGroup(container);
	var params = null;

	try {
		var h = window.location.toString().split('#')[1];
		if (h.indexOf("!") == 0)
			h = h.substring(1);
		params = deparam(h);
	} catch {}

	if (!(params instanceof Object))
		params = {};
	var owner = params;

	if (hashgroup != 'root') {
		if (params[hashgroup] == undefined)
			params[hashgroup] = {};
		owner = params[hashgroup];
	}

	if (toggle) {
		for (var property in hash) {
			if (Array.isArray(hash[property])) {
				if (!(Array.isArray(owner[property]))) {
					owner[property] = hash[property];
				} else {
					hash[property].forEach(function(value) {
						value = "" + value;
						var idx = owner[property].indexOf(value);
						if (idx < 0)
							owner[property].push(value);
						else
							owner[property].splice(idx, 1);
					});
				}
			} else {
				if (owner[property] == hash[property])
					delete owner[property];
				else
					owner[property] = hash[property];
			}
		}
	} else if (replace) {
		var current = WinletJSEngine.getHash(container);
		for (var property in current) {
			delete owner[property];
		}
		Object.assign(owner, hash);
	} else {
		Object.assign(owner, hash);
	}

	for (var property in owner) {
		if (owner[property] == '')
			delete owner[property];
	}

	WinletJSEngine.detectHashChange = false;
	var val = param(params);
	window.location.hash = "!" + val;
};

WinletJSEngine.getParam = function(container) {
	if (container == null) return {};

	var parent = null;
	if (container.dataset.winletSrcId != null)
		parent = qs('div[data-winlet-id="' + container.dataset.winletSrcId + '"]');
	else
		parent = container.parentElement ? container.parentElement.closest("div[data-winlet-id], div[data-winlet-src-id]") : null;

	var obj = {};
	if (parent != null)
		Object.assign(obj, WinletJSEngine.getParam(parent));

	var params = container.getAttribute("data-winlet-params");
	if (params != null) {
		if (typeof params == "string")
			Object.assign(obj, WinletJSEngine.parseJson(params));
		else
			Object.assign(obj, params);
	}

	return obj;
};

WinletJSEngine.mergeParam = function(container) {
	var obj = {};

	Object.assign(obj, WinletJSEngine.getParam(container));

	var idx = window.location.href.indexOf('?');
	if (idx > 0) {
		var queryStr = window.location.href.substr(idx + 1);
		idx = queryStr.indexOf("#");
		if (idx > 0)
			queryStr = queryStr.substr(0, idx);
		Object.assign(obj, deparam(queryStr));
	}

	try {
		Object.assign(obj, WinletJSEngine.getHash(container));
	} catch {}

	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] != null)
			Object.assign(obj, arguments[i]);
	}

	return param(obj, true);
};
