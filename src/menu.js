/**
 * Context menu functions - replaces $.fn.WinletMenu, $.fn.WinletContextMenu, $.fn.WinletClickMenu
 */
import { offset as getOffset } from './utils/dom.js';

// Reuse getRect from drag module logic
function getRect(elm) {
	var o = getOffset(elm);
	return {
		top: o.top,
		left: o.left,
		width: elm.offsetWidth,
		height: elm.offsetHeight,
		bottom: o.top + elm.offsetHeight,
		right: o.left + elm.offsetWidth
	};
}

export function winletMenu(trigger, event, menuSelector, position, space) {
	trigger.style.cursor = "context-menu";

	var menu = document.querySelector(menuSelector);
	if (!menu) return;

	menu.style.display = "none";

	var menuOffset = null;
	var bodyMouseUpHandler = null;

	trigger.addEventListener(event, function(e) {
		menu._menuSrc = trigger;

		var posi;

		if (position == null) {
			posi = { top: e.pageY, left: e.pageX };
		} else {
			if (space == null) space = 0;

			var rect = getRect(e.target);
			if (position == "bottomleft")
				posi = { top: rect.bottom + space, left: rect.left };
			else if (position == "topright")
				posi = { top: rect.top, left: rect.right + space };
			else if (position == "bottomright")
				posi = { top: rect.bottom + space, left: rect.right + space };
			else
				posi = { top: rect.top, left: rect.left };
		}

		if (menuOffset == null) {
			menu.style.position = "absolute";
			menu.style.display = "block";
			menu.style.top = "0";
			menu.style.left = "0";
			menuOffset = getOffset(menu);
		}

		menu.style.display = "block";
		menu.style.top = (posi.top - menuOffset.top) + "px";
		menu.style.left = (posi.left - menuOffset.left) + "px";

		// Remove previous handler if any
		if (bodyMouseUpHandler) {
			document.body.removeEventListener("mouseup", bodyMouseUpHandler);
		}

		bodyMouseUpHandler = function(upevent) {
			if (upevent.target == e.target && upevent.button == 2)
				return;
			menu.style.display = "none";
			document.body.removeEventListener("mouseup", bodyMouseUpHandler);
			bodyMouseUpHandler = null;
		};

		document.body.addEventListener("mouseup", bodyMouseUpHandler);

		e.preventDefault();
		return false;
	});
}

export function winletContextMenu(trigger, menuSelector, position, space) {
	winletMenu(trigger, "contextmenu", menuSelector, position, space);
}

export function winletClickMenu(trigger, menuSelector, position, space) {
	winletMenu(trigger, "click", menuSelector, position, space);
}
