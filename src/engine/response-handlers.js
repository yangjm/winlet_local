import { WinletJSEngine } from './core.js';
import { ajax } from '../utils/ajax.js';
import { Deferred, whenAll } from '../utils/deferred.js';
import { domReady, qsa } from '../utils/dom.js';

WinletJSEngine.getWinletResponseHeaders = function(data, jqXHR) {
	var headers = {};
	headers.redirect = jqXHR.getResponseHeader('X-Winlet-Redirect');
	headers.update = jqXHR.getResponseHeader('X-Winlet-Update');
	headers.target = jqXHR.getResponseHeader('X-Winlet-Target');
	headers.dialog = jqXHR.getResponseHeader('X-Winlet-Dialog');
	headers.cache = jqXHR.getResponseHeader('X-Winlet-Cache');
	headers.title = WinletJSEngine._utf8_decode(jqXHR.getResponseHeader('X-Winlet-Title'));

	if (WinletJSEngine.winletDomain && data) {
		var settings = WinletJSEngine.reWinletHeader.exec(data);
		if (settings) {
			data = data.replace(WinletJSEngine.reWinletHeader, '');
			settings = JSON.parse(settings[1]);
			if (settings["X-Winlet-Redirect"]) headers.redirect = settings["X-Winlet-Redirect"];
			if (settings["X-Winlet-Update"]) headers.update = settings["X-Winlet-Update"];
			if (settings["X-Winlet-Dialog"]) headers.dialog = settings["X-Winlet-Dialog"];
			if (settings["X-Winlet-Cache"]) headers.cache = settings["X-Winlet-Cache"];
			if (settings["X-Winlet-Title"]) headers.title = settings["X-Winlet-Title"];
			if (settings["X-Winlet-Session-ID"]) WinletJSEngine.setSessionId(settings["X-Winlet-Session-ID"]);
		}
	}
	return headers;
};

WinletJSEngine.getWindowResponseHandler = function(container, focus) {
	var winlet = WinletJSEngine.traceToWinlet(container);

	return function(data, textStatus, jqXHR) {
		var headers = WinletJSEngine.getWinletResponseHeaders(data, jqXHR);
		if (data) {
			data = data.replace(WinletJSEngine.reWinletHeader, '');
			var mtitle = data.match(WinletJSEngine.reMetaTitle);
			if (mtitle) document.title = mtitle[1];
			data = data.replace(WinletJSEngine.reMeta, '');
		}

		if (container == null) return;

		if (headers.redirect != null && headers.redirect != "") {
			location.href = headers.redirect;
			return;
		}

		var dialog = false;
		if (WinletJSEngine.isRootWinlet(container) && WinletJSEngine.getWinSettings(container).dialog == "yes") {
			dialog = true;
			WinletJSEngine.openDialog(container, data, headers.title);
		} else {
			container.innerHTML = WinletJSEngine.procStyle(WinletJSEngine
				.procWinFunc(data.replace(WinletJSEngine.reScriptAll, ''), container));
			domReady(function() {
				WinletJSEngine.enableForm(container);
				WinletJSEngine.updateHref(container);
			});
			WinletJSEngine.procScript(data, container);
		}

		WinletJSEngine.invokeAfterLoad(container);
		WinletJSEngine.clearLoading(container);
		if (winlet)
			winlet.dispatchEvent(new CustomEvent("WinletWindowLoaded", { bubbles: true }));

		if (!dialog && focus)
			WinletJSEngine.ensureVisible(container);
	};
};

WinletJSEngine.loadContent = function(container, focus, pageRefresh, loadWhenHashChanged, isInclude) {
	var dfd = Deferred();

	var winlet = WinletJSEngine.traceToWinlet(container);
	if (winlet == null)
		return dfd.reject().promise();

	var hashParams = WinletJSEngine.getHash(winlet);
	if (!pageRefresh && loadWhenHashChanged) {
		var savedParams = winlet.hashParams;

		if (hashParams == null && savedParams == null)
			return dfd.resolve().promise();

		if (hashParams != null && savedParams != null && Object.keys(hashParams).length == Object.keys(savedParams).length) {
			var same = true;

			for (var key in hashParams) {
				if (Object.prototype.toString.call(hashParams[key]) === '[object Array]') {
					if (Object.prototype.toString.call(savedParams[key]) !== '[object Array]')
						same = false;
					else {
						// Compare arrays
						var a1 = hashParams[key], a2 = savedParams[key];
						if (a1.length !== a2.length) same = false;
						else {
							for (var ai = 0; ai < a1.length; ai++) {
								if (a2.indexOf(a1[ai]) < 0) { same = false; break; }
							}
						}
					}
				} else if (hashParams[key] != savedParams[key]) {
					same = false;
					break;
				}
			}

			if (same)
				return dfd.resolve().promise();
		}
	}
	winlet.hashParams = hashParams;

	WinletJSEngine.showLoading(winlet);
	var fullUrl = WinletJSEngine.getFullUrl(WinletJSEngine.getWinletUrl(winlet));
	ajax({
		type: 'POST',
		url: fullUrl,
		data: WinletJSEngine.mergeParam(winlet, {
			_x: 'y',
			_pg: window.location.pathname,
			_purl: window.location.href,
			_pr: pageRefresh ? "yes" : "no",
			_fi: isInclude ? "yes" : "no",
			_dn: WinletJSEngine.winletDomain
		}),
		success: function(data, textStatus, jqXHR) {
			WinletJSEngine.getWindowResponseHandler(winlet, focus)(data, textStatus, jqXHR);
			dfd.resolve();
		},
		error: function(req, textStatus, errorThrown) {
			WinletJSEngine.getErrorHandler(winlet)(req, textStatus, errorThrown);
			dfd.reject();
		},
		dataType: "html"
	});
	WinletJSEngine.analyticWindow(fullUrl);

	return dfd.promise();
};

WinletJSEngine.updateWindows = function(container, wins, nofocus) {
	if (wins == null || wins == '')
		return Deferred().resolve().promise();

	var winlet = WinletJSEngine.traceToWinlet(container);

	var update = wins.split(',');
	var dfds = [];

	for (var i = 0; i < update.length; i++) {
		try {
			var ud = update[i].trim();

			if (ud == "winlet" || ud == "window") {
				dfds.push(WinletJSEngine.loadContent(winlet));
				continue;
			}

			if (ud == "parent") {
				var parent = WinletJSEngine.getWinlet(winlet.parentElement);
				if (parent != null)
					dfds.push(WinletJSEngine.loadContent(parent));
				continue;
			}

			if (ud == "root") {
				var root = WinletJSEngine.getRootWinlet(winlet);
				if (root != null)
					dfds.push(WinletJSEngine.loadContent(root));
				continue;
			}

			var focusUpdate = false;
			if (ud.indexOf("!") == 0) {
				focusUpdate = true;
				ud = ud.substring(1);
			}

			if (ud.indexOf("/") == 0)
				ud = ud.substring(1);

			if (ud.indexOf("/") >= 0)
				ud = WinletJSEngine.getContextRoot(winlet) + ud;
			else
				ud = WinletJSEngine.getWinletRoot(winlet) + ud;

			qsa('div[data-winlet-url^="' + ud + '"]').forEach(function(el) {
				dfds.push(WinletJSEngine.loadContent(el, focusUpdate && !nofocus));
			});
		} catch {}
	}

	return whenAll(dfds);
};

WinletJSEngine.getActionResponseHandler = function(container, focus) {
	var form = null;
	var funcs = null;

	for (var i = 2; i < arguments.length; i++) {
		if (arguments[i] == null) continue;
		if (Object.prototype.toString.call(arguments[i]) == '[object Array]')
			funcs = arguments[i];
		else
			form = arguments[i];
	}

	return function(data, textStatus, jqXHR) {
		var dfd = Deferred();

		var headers = WinletJSEngine.getWinletResponseHeaders(data, jqXHR);
		if (data) {
			data = data.replace(WinletJSEngine.reWinletHeader, '');
			var mtitle = data.match(WinletJSEngine.reMetaTitle);
			if (mtitle) document.title = mtitle[1];
			data = data.replace(WinletJSEngine.reMeta, '');
		}

		if (headers.redirect != null && headers.redirect != "") {
			location.href = headers.redirect;
			return dfd.resolve().promise();
		}

		if (headers.update == "page") {
			location.reload();
			return dfd.resolve().promise();
		}

		WinletJSEngine.clearLoading(container);

		if (form != null && headers.dialog != "yes" && data.indexOf("WINLET_FORM_RESP:") == 0) {
			try {
				WinletJSEngine.form.validateClearAll(form);
				WinletJSEngine.form.applyChanges(data.substr(17), form);
			} catch (e) {
				console.error("[winlet] form validation error:", e);
			}

			if (form.onerror != undefined) {
				try { form.onerror(null); } catch {}
			}
			return dfd.resolve().promise();
		}

		var d;
		if (headers.dialog != "yes")
			d = WinletJSEngine.closeDialog(container);
		else {
			d = Deferred();
			d.resolve();
			d = d.promise();
		}

		d.then(function() {
			var dataProcessed = false;
			if (funcs != null) {
				for (var fi = 0; fi < funcs.length; fi++) {
					try {
						var ret = funcs[fi](data, textStatus, jqXHR, container);
						if (ret != undefined && ret != null && !ret) {
							dataProcessed = true;
							break;
						}
					} catch (e) {
						console.error(e);
					}
				}
			}

			if (headers.dialog == "yes") {
				if (!dataProcessed)
					WinletJSEngine.openDialog(container, data, headers.title);
			} else {
				if (!dataProcessed && !(headers.cache == "yes")) {
					var targetContainer = container;
					if (headers.target == 'window' || headers.target == 'winlet')
						targetContainer = WinletJSEngine.traceToWinlet(container);

					WinletJSEngine.getWindowResponseHandler(targetContainer,
						focus && (headers.update == null || headers.update.indexOf('!') == -1))(data, textStatus, jqXHR);
				}
			}

			WinletJSEngine.updateWindows(container, headers.update)
				.then(function() { dfd.resolve(); })
				.catch(function() { dfd.reject(); });
		});

		return dfd.promise();
	};
};
