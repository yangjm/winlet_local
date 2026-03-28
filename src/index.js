import './winlet.css';
import './drag.css';
import './modal.css';

import { WinletJSEngine, deparam } from './engine/index.js';
import { installDialog } from './dialog.js';
import { winform } from './form.js';
import { WinletDrag } from './drag_module.js';
import { winletMenu, winletContextMenu, winletClickMenu } from './menu.js';
import { Deferred } from './utils/deferred.js';
import { ajax } from './utils/ajax.js';
import { serializeForm } from './utils/dom.js';

// Wire winform into the engine's enableForm
window._winletWinform = winform;

// Install dialog (modal) support into the engine
installDialog(WinletJSEngine, winform);

// Hashchange listener
var backToPrevPage = false;

window.addEventListener('hashchange', function() {
	if (backToPrevPage) {
		history.go(-1);
		return;
	}

	WinletJSEngine.analyticHashChanged();

	if (!WinletJSEngine.detectHashChange)
		WinletJSEngine.detectHashChange = true;
	else {
		// Reload windows that have hash parameters
		document.querySelectorAll('div[data-winlet-url]').forEach(function(el) {
			WinletJSEngine.loadContent(el, false, false, true);
		});
	}

	if (WinletJSEngine.hashchange)
		WinletJSEngine.hashchange();
});

// The public API object
var win$ = {
	engine: WinletJSEngine,

	init: function(settings) { return WinletJSEngine.init(settings); },
	setup: function(settings) { return WinletJSEngine.setup(settings); },
	ensureVisible: function(el) { return WinletJSEngine.ensureVisible(el); },
	form: WinletJSEngine.form,
	showLoading: function(c, d, n) { return WinletJSEngine.showLoading(c, d, n); },
	getPositionInViewport: function(el) { return WinletJSEngine.getPositionInViewport(el); },
	parseJson: function(str) { return WinletJSEngine.parseJson(str); },

	getParams: function(params, container) {
		try {
			if (typeof params == "string") {
				if (params.indexOf("{") == 0)
					return JSON.parse(params);
				if (params.indexOf("=") > 0)
					return deparam(params);
				else
					params = WinletJSEngine.getForm(container, params);
			}

			if (params != null && params instanceof HTMLFormElement)
				return deparam(serializeForm(params));
		} catch {}

		return params;
	},

	back: function() {
		backToPrevPage = true;
		history.go(-1);
	},

	_winlet: function(element) {
		return WinletJSEngine.getWinlet(element);
	},

	_container: function(element) {
		return WinletJSEngine.getContainer(element);
	},

	post: function(action) {
		return win$._post(null, null, action);
	},

	_post: function(element, container, action) {
		if (action == null) action = "";

		var dfd = Deferred();

		var cont = null;

		if (element != null) {
			cont = WinletJSEngine.getContainer(element);
			if (cont == null)
				return dfd.reject().promise();
		}

		var hash = null;
		var focus = false;

		if (typeof action == "object") {
			hash = action.hash;
			if (action.hasOwnProperty("focus"))
				focus = action.focus;
			action = action.action;
		}

		var idx = action.indexOf(":");
		if (idx > 0) {
			var winletName = action.substr(0, idx);
			action = action.substr(idx + 1);

			var matches = document.querySelectorAll('div[data-winlet-url^="' + WinletJSEngine.getWinletUrl(cont, winletName) + '"]');
			if (matches.length == 0)
				return dfd.reject().promise();

			cont = matches[0];
		}

		if (cont == null)
			return dfd.reject().promise();

		var hasTarget = false;
		if (container != null) {
			var targetContainer = null;

			if (container instanceof HTMLElement)
				targetContainer = container;
			else if (typeof container === "string") {
				if (container.indexOf("#") == 0)
					targetContainer = document.querySelector(container);
				else if (cont.matches(container))
					targetContainer = cont;
				else
					targetContainer = cont.querySelector(container);
			}

			if (targetContainer == null)
				return dfd.reject().promise();

			if (targetContainer.dataset.winletId == null || targetContainer.dataset.winletId == '')
				targetContainer.setAttribute("data-winlet-id", ++WinletJSEngine.winletId);
			targetContainer.removeAttribute("data-winlet-url");

			targetContainer.setAttribute("data-winlet-src-id", cont.dataset.winletId);
			cont = targetContainer;
			hasTarget = true;
		}

		var params = {};
		var funcs = [];

		if (hash != null)
			WinletJSEngine.setHash(cont, hash);

		for (var i = 3; i < arguments.length; i++) {
			if (arguments[i] == null) continue;
			if (typeof arguments[i] === 'function')
				funcs.push(arguments[i]);
			else
				Object.assign(params, win$.getParams(arguments[i], cont));
		}

		if (hasTarget && cont.getAttribute("data-winlet-url") == null)
			cont.setAttribute("data-winlet-params", JSON.stringify(params));

		var fullUrl = WinletJSEngine.getFullUrl(WinletJSEngine.getWinletUrl(cont));
		ajax({
			type: 'POST',
			url: fullUrl,
			data: WinletJSEngine.mergeParam(cont, params, {
				_x: 'y',
				_a: action,
				_pg: window.location.pathname,
				_purl: window.location.href,
				_c: (cont.getAttribute("data-winlet-url") == null ? 'y' : 'n'),
				_dn: WinletJSEngine.winletDomain
			}),
			success: function(data, textStatus, jqXHR) {
				WinletJSEngine.getActionResponseHandler(cont, focus, funcs)(data, textStatus, jqXHR)
				.then(function() { dfd.resolve(); })
				.catch(function() { dfd.reject(); });
			},
			error: function(req, textStatus, errorThrown) {
				WinletJSEngine.getErrorHandler(cont)(req, textStatus, errorThrown);
				dfd.reject();
			},
			dataType: "html"
		});
		WinletJSEngine.analyticAction(fullUrl);

		return dfd.promise();
	},

	_include: function(element, container, url, focus) {
		if (!container)
			return Deferred().reject().promise();

		var cont = null;
		if (element != null)
			cont = WinletJSEngine.getContainer(element);

		var target = null;
		if (container instanceof HTMLElement)
			target = container;
		else if (typeof container === "string") {
			if (container.indexOf("#") == 0)
				target = document.querySelector(container);
			else if (cont != null)
				target = cont.querySelector(container);
		}

		if (target == null)
			return Deferred().reject().promise();

		if (target.dataset.winletId == null || target.dataset.winletId == '')
			target.setAttribute("data-winlet-id", ++WinletJSEngine.winletId);

		if (element != null) {
			if (cont == null)
				return Deferred().reject().promise();

			var params = {};
			for (var i = 4; i < arguments.length; i++) {
				if (arguments[i] == null) continue;
				Object.assign(params, win$.getParams(arguments[i], cont));
			}

			target.setAttribute("data-winlet-params", JSON.stringify(params));
			target.setAttribute("data-winlet-url", WinletJSEngine.getWinletUrl(cont, url));
		} else {
			var params2 = {};
			for (var j = 3; j < arguments.length; j++) {
				if (arguments[j] == null) continue;
				Object.assign(params2, arguments[j]);
			}
			target.setAttribute("data-winlet-params", JSON.stringify(params2));
			target.setAttribute("data-winlet-url", url);
		}

		if (cont != null)
			target.setAttribute("data-winlet-src-id", cont.dataset.winletId);

		return WinletJSEngine.loadContent(target, focus, null, null, true);
	},

	_ajax: function(element, paramFunc) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null) return null;
		ajax(paramFunc(container));
		return false;
	},

	_get: function(element, param) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null)
			return Deferred().reject().promise();

		var reload = true;
		var update = null;
		var focus = true;
		var replace = false;

		if (param != null) {
			if (typeof param == "object") {
				for (var prop in param) {
					if ("reload" == prop) reload = param[prop];
					if ("update" == prop) update = param[prop];
					if ("focus" == prop) focus = param[prop];
					if ("replaceHash" == prop) replace = param[prop];
				}
			} else {
				update = param;
			}
		}

		var params = {};
		for (var i = 2; i < arguments.length; i++)
			Object.assign(params, win$.getParams(arguments[i], container));

		var focusUpdate = false;
		if (update && update.indexOf("!") >= 0)
			focusUpdate = true;

		var arr = [];
		WinletJSEngine.setHash(container, params, false, replace);
		if (reload)
			arr.push(WinletJSEngine.loadContent(container, focus && !focusUpdate));
		if (update)
			arr.push(WinletJSEngine.updateWindows(container, update));

		if (arr.length > 0) {
			var p = Promise.all(arr);
			p.done = function(fn) { p.then(fn); return p; };
			p.fail = function(fn) { p.catch(fn); return p; };
			return p;
		}

		return Deferred().resolve().promise();
	},

	_toggle: function(element, update) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null)
			return Deferred().reject().promise();

		var params = {};
		for (var i = 2; i < arguments.length; i++)
			Object.assign(params, win$.getParams(arguments[i], container));

		WinletJSEngine.setHash(container, params, true);

		var p = Promise.all([
			WinletJSEngine.loadContent(container),
			WinletJSEngine.updateWindows(container, update)
		]);
		p.done = function(fn) { p.then(fn); return p; };
		p.fail = function(fn) { p.catch(fn); return p; };
		return p;
	},

	_url: function(element, action) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null) return false;

		var params = {};
		for (var i = 2; i < arguments.length; i++)
			Object.assign(params, win$.getParams(arguments[i], container));

		var url = WinletJSEngine.getFullUrl(WinletJSEngine.getWinletUrl(container));
		if (url.indexOf("?") > 0)
			url += "&";
		else
			url += "?";

		return url + WinletJSEngine.mergeParam(container, params, {
			_x: 'y',
			_a: action,
			_pg: window.location.pathname,
			_purl: window.location.href,
			_dn: WinletJSEngine.winletDomain
		});
	},

	_submit: function(element, form, action) {
		var dfd = Deferred();
		var container = WinletJSEngine.getContainer(element);
		if (container == null)
			return dfd.reject().promise();

		var f = null;
		if (typeof form === 'string')
			f = WinletJSEngine.getForm(container, form);
		else {
			try {
				f = (form instanceof HTMLElement) ? form.closest("form") : null;
			} catch {}
		}
		if (f == null || !f.setAction)
			return dfd.reject().promise();

		f.setAction(action);

		var nofocus = false;
		var params = {};
		for (var i = 3; i < arguments.length; i++) {
			if (arguments[i] == null) continue;
			if (i == 3 && typeof(arguments[i]) === "boolean") {
				nofocus = arguments[i];
				continue;
			}
			Object.assign(params, win$.getParams(arguments[i], container));
		}

		for (var key in params) {
			var inp = f.querySelector("input[name=" + key + "]");
			if (inp) inp.value = params[key];
		}

		f.windeferred = dfd;
		f.nofocus = nofocus;
		f.winsubmit();

		return dfd.promise();
	},

	_aftersubmit: function(element, form) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null) return false;

		var f = WinletJSEngine.getForm(container, form);
		if (f == null) return false;

		var funcs = [];
		for (var i = 2; i < arguments.length; i++) {
			if (arguments[i] == null) continue;
			if (typeof arguments[i] === 'function')
				funcs.push(arguments[i]);
		}

		f.aftersubmit = funcs;
		return false;
	},

	_find: function(element, query) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null) return null;
		if (!query) return container;

		var found = container.querySelector(query);
		if (found != null)
			return found;

		var dialog = WinletJSEngine.getDialog(WinletJSEngine.traceToWinlet(container), false);
		if (dialog == null) return null;
		return dialog.querySelector(query);
	},

	_wait: function(element, selector, maxwait) {
		var container = WinletJSEngine.getContainer(element);
		if (container == null) return false;

		var start = (new Date()).getTime();
		var dfd = Deferred();

		(function check() {
			if (container.querySelector(selector) == null) {
				if (maxwait != null && (new Date()).getTime() - start > maxwait)
					dfd.reject();
				else
					window.setTimeout(check, 300);
			} else {
				dfd.resolve();
			}
		})();

		return dfd.promise();
	},

	// Utility functions exposed as part of public API
	winform: winform,
	winletMenu: winletMenu,
	winletContextMenu: winletContextMenu,
	winletClickMenu: winletClickMenu,
	drag: WinletDrag
};

// UMD: assign to window for backward compatibility
if (typeof window !== 'undefined') {
	window.win$ = win$;
}

export default win$;
