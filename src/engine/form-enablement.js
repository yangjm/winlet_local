import { WinletJSEngine } from './core.js';
import { qsa } from '../utils/dom.js';

WinletJSEngine.invokeAfterLoad = function(container) {
	if (WinletJSEngine.afterLoad) {
		try { WinletJSEngine.afterLoad(container); } catch {}
	}
};

WinletJSEngine.enableForm = function(container) {
	var forms = container.querySelectorAll("form");
	forms.forEach(function(formEl) {
		var attrs = formEl.attributes;
		var hasWinletAttr = false;
		for (var i = 0; i < attrs.length; i++) {
			if (attrs[i].name.indexOf("data-winlet-") == 0) {
				hasWinletAttr = true;
				break;
			}
		}
		if (!hasWinletAttr) return;

		var containing = WinletJSEngine.getContainer(formEl);

		var settings = {
			winFocus: true,
			focus: formEl.getAttribute("data-winlet-focus"),
			update: formEl.getAttribute("data-winlet-update"),
			validate: formEl.getAttribute("data-winlet-validate"),
			hideloading: formEl.getAttribute("data-winlet-hideloading"),
			container: containing == null ? container : containing
		};

		if ("true" == formEl.getAttribute("data-winlet-win-nofocus"))
			settings.winFocus = false;
		if (settings.validate == null || settings.validate == "")
			settings.validate = "form";

		// winform is attached by index.js
		if (typeof window._winletWinform === 'function')
			window._winletWinform(formEl, settings);
	});
};

WinletJSEngine.updateHref = function(container) {
	qsa("a[data-winlet-href]", container).forEach(function(a) {
		var href = a.dataset.winletHref;
		if (WinletJSEngine.startsWith(href, "javascript:"))
			a.setAttribute("href", href);
		else {
			try {
				a.setAttribute("href", eval(href));
			} catch {}
		}
	});
};
