import { WinletJSEngine, ElmRect } from './core.js';

WinletJSEngine.getViewport = function() {
	var rect = {};
	var doc = document.documentElement;
	rect.left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	rect.top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
	rect.width = doc.clientWidth;
	rect.height = doc.clientHeight;

	rect.left += WinletJSEngine.leftSpace;
	rect.width -= (WinletJSEngine.leftSpace + WinletJSEngine.rightSpace);
	rect.top += WinletJSEngine.topSpace;
	rect.height -= (WinletJSEngine.topSpace + WinletJSEngine.bottomSpace);

	if (rect.width < 0) rect.width = 0;
	if (rect.height < 0) rect.height = 0;

	rect.bottom = rect.top + rect.height;
	rect.right = rect.left + rect.width;

	return rect;
};

WinletJSEngine.getPositionInViewport = function(element) {
	var viewport = WinletJSEngine.getViewport();
	var rect = new ElmRect(element);

	rect.left = rect.left - viewport.left;
	rect.top = rect.top - viewport.top;
	rect.right = rect.right - viewport.left;
	rect.bottom = rect.bottom - viewport.top;
	rect.viewport = viewport;

	return rect;
};

WinletJSEngine.ensureVisible = function(element) {
	try {
		var doc = document.documentElement;
		var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
		var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
		var rect = {};

		if (Object.prototype.toString.call(element) === '[object Array]') {
			if (element.length == 0) return;
			rect = new ElmRect(element[0]);
			for (var i = 1; i < element.length; i++) {
				rect.union(new ElmRect(element[i]));
			}
		} else {
			rect = new ElmRect(element);
		}

		rect.top -= WinletJSEngine.topSpace;
		rect.bottom += WinletJSEngine.bottomSpace;
		rect.left -= WinletJSEngine.leftSpace;
		rect.right += WinletJSEngine.rightSpace;
		rect.bottom += 2;

		var scrollX = 0;
		if (left + doc.clientWidth < rect.right)
			scrollX = rect.right - left - doc.clientWidth;
		if (left + scrollX > rect.left)
			scrollX = rect.left - left;

		var scrollY = 0;
		if (top + doc.clientHeight < rect.bottom)
			scrollY = rect.bottom - top - doc.clientHeight;
		if (top + scrollY > rect.top)
			scrollY = rect.top - top;

		if (scrollX != 0 || scrollY != 0) {
			window.scrollBy({ top: scrollY, left: scrollX, behavior: 'smooth' });
		}
	} catch {}
};
