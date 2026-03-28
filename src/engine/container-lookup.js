import { WinletJSEngine } from './core.js';
import { qs } from '../utils/dom.js';

WinletJSEngine.getForm = function(container, name) {
	if (container == null || name == null)
		return null;

	var f = container.querySelector('form[name="' + name + '"]');
	if (f != null)
		return f;

	if (container.dlg != null)
		f = container.dlg.querySelector('form[name="' + name + '"]');
	return f;
};

WinletJSEngine.isRootWinlet = function(winlet) {
	return winlet.getAttribute("data-winlet-url") != null && winlet.parentElement.closest("div[data-winlet-url]") == null;
};

WinletJSEngine.getContainer = function(element) {
	if (element == null) return null;

	var container = null;

	if (typeof element === "number")
		container = qs('div[data-winlet-id="' + element + '"]');
	else if (typeof element === "string" && element.match(/^\d+$/))
		container = qs('div[data-winlet-id="' + element + '"]');
	else if (element instanceof HTMLElement)
		container = element.closest("div[data-winlet-id]");
	else
		return null;

	return container;
};

WinletJSEngine.getRootWinlet = function(element) {
	var winlet = null;
	var container = WinletJSEngine.getContainer(element);
	if (container == null)
		return winlet;
	if (container.getAttribute("data-winlet-url") != null)
		winlet = container;
	var parent = container.parentElement ? container.parentElement.closest("div[data-winlet-url]") : null;
	if (parent == null)
		return winlet;
	do {
		winlet = parent;
		parent = winlet.parentElement ? winlet.parentElement.closest("div[data-winlet-url]") : null;
	} while(parent != null);
	return winlet;
};

WinletJSEngine.traceToWinlet = function(container) {
	if (container == null)
		return null;

	if (container.getAttribute("data-winlet-url") != null)
		return container;

	var srcId = container.dataset.winletSrcId;
	if (!srcId) return null;

	return WinletJSEngine.traceToWinlet(qs('div[data-winlet-id="' + srcId + '"]'));
};

WinletJSEngine.getWinlet = function(element) {
	return WinletJSEngine.traceToWinlet(WinletJSEngine.getContainer(element));
};
