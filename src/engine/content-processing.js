import { WinletJSEngine } from './core.js';
import { Deferred, whenAll } from '../utils/deferred.js';

WinletJSEngine.procStyle = function(cont) {
	var css = cont.match(WinletJSEngine.reCSSAll) || [];
	var cssHref = css.map(function(tag) {
		return (tag.match(WinletJSEngine.reCSSHref) || ['', ''])[1];
	});

	var elmHead = document.getElementsByTagName("head")[0];
	var elmLinks = elmHead.getElementsByTagName("link");

	for (var i = 0; i < cssHref.length; i++) {
		if (cssHref[i] == "") continue;

		var found = false;
		for (var j = 0; j < elmLinks.length; j++) {
			if (elmLinks[j].href == cssHref[i]) {
				found = true;
				break;
			}
		}
		if (found) continue;

		var newCss = document.createElement('link');
		newCss.type = 'text/css';
		newCss.rel = 'stylesheet';
		newCss.href = cssHref[i];
		newCss.media = 'screen';
		elmHead.appendChild(newCss);
	}

	return cont.replace(WinletJSEngine.reCSSAll, '');
};

WinletJSEngine.procWinFunc = function(cont, container) {
	var containerId = container.dataset.winletId;
	if (containerId == null)
		return null;

	return cont.replace(WinletJSEngine.reWinPostEmpty,
			'win$._post(' + containerId + ', null)').replace(WinletJSEngine.reWinPost,
			'win$._post(' + containerId + ', null, ').replace(
			WinletJSEngine.reWinEmbed,
			'win$._post(' + containerId + ', ').replace(
			WinletJSEngine.reWinInclude,
			'win$._include(' + containerId + ', ').replace(
			WinletJSEngine.reWinWinlet, 'win$._winlet(' + containerId)
		.replace(WinletJSEngine.reWinContainer,
			'win$._container(' + containerId).replace(
			WinletJSEngine.reWinAjax,
			'win$._ajax(' + containerId + ', ').replace(
			WinletJSEngine.reWinGet,
			'win$._get(' + containerId + ', ').replace(
			WinletJSEngine.reWinToggle,
			'win$._toggle(' + containerId + ', ').replace(
			WinletJSEngine.reWinUrl,
			'win$._url(' + containerId + ', ').replace(
			WinletJSEngine.reWinSubmit,
			'win$._submit(' + containerId + ', ').replace(
			WinletJSEngine.reWinFind,
			'win$._find(' + containerId + ', ').replace(
			WinletJSEngine.reWinWait,
			'win$._wait(' + containerId + ', ').replace(
			WinletJSEngine.reWinAfterSubmit,
			'win$._aftersubmit(' + containerId + ', ');
};

WinletJSEngine.procScript = function(cont, container) {
	var containerId = container.dataset.winletId;
	if (containerId == null)
		return null;

	var scripts = cont.match(WinletJSEngine.reScriptAll) || [];
	var scriptContent = scripts.map(function(tag) { return (tag.match(WinletJSEngine.reScriptOne) || ['', '', ''])[2]; });
	var scriptDef = scripts.map(function(tag) { return (tag.match(WinletJSEngine.reScriptOne) || ['', '', ''])[1]; });
	var scriptLanguage = scriptDef.map(function(tag) { return (tag.match(WinletJSEngine.reScriptLanguage) || ['', ''])[1]; });
	var scriptSrc = scriptDef.map(function(tag) { return (tag.match(WinletJSEngine.reScriptSrc) || ['', ''])[1]; });
	var scriptType = scriptDef.map(function(tag) { return (tag.match(WinletJSEngine.reScriptType) || ['', ''])[1]; });
	var scriptCharset = scriptDef.map(function(tag) { return (tag.match(WinletJSEngine.reScriptCharset) || ['', ''])[1]; });

	var elmHead = document.getElementsByTagName("head")[0];
	var elmScripts = document.querySelectorAll("script");
	var ret = [];

	for (var i = 0; i < scripts.length; i++) {
		if (scriptSrc[i] == "") continue;

		var found = false;
		for (var j = 0; j < elmScripts.length; j++) {
			if (elmScripts[j].src == scriptSrc[i]) {
				found = true;
				break;
			}
		}
		if (found) continue;

		var dfd = Deferred();

		var newScript = document.createElement('script');
		if (scriptType[i] != "")
			newScript.type = scriptType[i];
		else if (scriptLanguage[i] != "")
			newScript.type = "text/" + scriptLanguage[i];
		else
			newScript.type = "text/javascript";
		if (scriptCharset[i] != "")
			newScript.charset = scriptCharset[i];

		(function(d) {
			newScript.addEventListener('load', function() { d.resolve(); });
			newScript.addEventListener('readystatechange', function() {
				if (newScript.readyState == 'loaded') d.resolve();
			});
		})(dfd);

		elmHead.appendChild(newScript);
		newScript.src = scriptSrc[i];
		ret.push(dfd.promise());
	}

	whenAll(ret).then(function() {
		for (var k = 0; k < scriptContent.length; k++)
			try {
				eval(WinletJSEngine.procWinFunc(scriptContent[k], container));
			} catch (e) {
				console.error(e.message);
				console.error(scriptContent[k]);
			}
	});
};
