/**
 * DOM helper utilities replacing common jQuery patterns.
 */

/** querySelector shorthand */
export function qs(selector, parent) {
	return (parent || document).querySelector(selector);
}

/** querySelectorAll as real array */
export function qsa(selector, parent) {
	return Array.from((parent || document).querySelectorAll(selector));
}

/** Get element offset relative to document (replaces $.offset()) */
export function offset(el) {
	var rect = el.getBoundingClientRect();
	return {
		top: rect.top + window.pageYOffset,
		left: rect.left + window.pageXOffset
	};
}

/** Serialize form to URL-encoded string (replaces $.fn.serialize()) */
export function serializeForm(form) {
	return new URLSearchParams(new FormData(form)).toString();
}

/** Create element from HTML string */
export function createElement(html) {
	var div = document.createElement("div");
	div.innerHTML = html.trim();
	return div.firstChild;
}

/** DOMReady helper (replaces $(function(){...})) */
export function domReady(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}
