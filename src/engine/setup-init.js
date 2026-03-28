import { WinletJSEngine } from './core.js';
import { deparam } from '../utils/deparam.js';
import { Deferred, whenAll } from '../utils/deferred.js';
import { qs, qsa, domReady } from '../utils/dom.js';

WinletJSEngine.getErrorHandler = function(_container) {
	return function(_req, _textStatus, _errorThrown) {};
};

WinletJSEngine.isInt = function(n) {
	return n != undefined && n != null && Number(n) === n && n % 1 === 0;
};

WinletJSEngine.getWinletDomainByScript = function(namePattern) {
	var lm = location.href.match(/(http(s)?:\/\/[^\/]+)\//i);
	var pageDomain = lm ? lm[1] : null;
	var scriptDomain = null;

	var pattern = new RegExp('^(http(s)?://[^/]+)/.*' + namePattern, 'i');
	document.querySelectorAll('script').forEach(function(script) {
		if (scriptDomain != null) return;
		var match = script.src.match(pattern);
		if (match && match[1] != pageDomain)
			scriptDomain = match[1];
	});

	return scriptDomain;
};

WinletJSEngine.setup = function(settings) {
	if (settings) {
		if (settings.analytic && settings.analytic.hashChanged)
			WinletJSEngine.analyticHashChanged = function() { settings.analytic.hashChanged(); };
		if (settings.analytic && settings.analytic.window)
			WinletJSEngine.analyticWindow = function(url) { settings.analytic.window(url); };
		if (settings.analytic && settings.analytic.action)
			WinletJSEngine.analyticAction = function(url) { settings.analytic.action(url); };
		if (settings.analytic && settings.analytic.validate)
			WinletJSEngine.analyticValidate = function(url) { settings.analytic.validate(url); };

		if (WinletJSEngine.isInt(settings.left)) WinletJSEngine.leftSpace = settings.left;
		if (WinletJSEngine.isInt(settings.right)) WinletJSEngine.rightSpace = settings.right;
		if (WinletJSEngine.isInt(settings.top)) WinletJSEngine.topSpace = settings.top;
		if (WinletJSEngine.isInt(settings.bottom)) WinletJSEngine.bottomSpace = settings.bottom;
		if (settings.winletDomain) WinletJSEngine.winletDomain = settings.winletDomain;
		if (settings.contextRoot) WinletJSEngine.contextRoot = settings.contextRoot;
		if (settings.hashchange && typeof settings.hashchange === 'function')
			WinletJSEngine.hashchange = settings.hashchange;
		if (settings.afterload && typeof settings.afterload === 'function')
			WinletJSEngine.afterLoad = settings.afterload;
	}
};

WinletJSEngine.init = function(settings) {
	var dfd = Deferred();

	var proc = function() {
		var loads = [];

		if (settings == null) settings = {};
		WinletJSEngine.setup(settings);

		WinletJSEngine.isStatic = true;

		WinletJSEngine.updateHref(document.body);

		document.body.insertAdjacentHTML("beforeend",
			"<div id='winlet_style_temp' style='display:none'><div class='winlet_background'>1</div><div class='winlet_loading'>2</div><div class='winlet_validating'>3</div></div>");

		domReady(function() {
			var styleTemp = document.getElementById("winlet_style_temp");

			WinletJSEngine.ImgBg.src = getComputedStyle(qs(".winlet_background", styleTemp))
				.backgroundImage.replace(/^url|[\(\)"]/g, '');
			WinletJSEngine.ImgLoading.src = getComputedStyle(qs(".winlet_loading", styleTemp))
				.backgroundImage.replace(/^url|[\(\)"]/g, '');
			WinletJSEngine.ImgValidating.src = getComputedStyle(qs(".winlet_validating", styleTemp))
				.backgroundImage.replace(/^url|[\(\)"]/g, '');
			styleTemp.remove();

			qsa('div[data-winlet-url]').forEach(function(el) {
				WinletJSEngine.enableForm(el);
				WinletJSEngine.updateHref(el);
			});

			var hasHash = window.location.toString().indexOf("#") > 0;

			qsa('div[data-winlet]').forEach(function(el) {
				var preloaded = el.getAttribute("data-winlet-url") != null;

				var attr = el.dataset.winlet;
				if (!attr.indexOf("/") == 0)
					attr = "/" + attr;
				var match = attr.match(WinletJSEngine.reWinlet);

				var url = match[1];
				if (!url.indexOf("/") == 0)
					url = "/" + url;
				el.setAttribute("data-winlet-url", url);

				if (match.length > 5 && match[5] != null)
					el.setAttribute("data-winlet-params", JSON.stringify(deparam(match[5])));

				if (match.length > 7 && match[7] != null && match[7] != '') {
					var winSettings = {};
					var params = match[7].split(',');
					for (var pi = 0; pi < params.length; pi++) {
						var pmatch = params[pi].match(WinletJSEngine.reWinletParam);
						winSettings[pmatch[1]] = pmatch[2];
					}
					el.setAttribute("data-winlet-settings", JSON.stringify(winSettings));
				}

				if (preloaded) {
					if (hasHash)
						loads.push(WinletJSEngine.loadContent(el, false, true));
				} else {
					el.setAttribute("data-winlet-id", ++WinletJSEngine.winletId);
					loads.push(WinletJSEngine.loadContent(el, false, true));
				}
			});

			if (loads.length == 0)
				dfd.resolve();
			else
				whenAll(loads).then(function() { dfd.resolve(); });
		});
	};

	if (settings && settings.delay === false)
		proc();
	else
		domReady(proc);

	return dfd.promise();
};
