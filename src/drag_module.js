/**
 * Drag-and-drop module - vanilla JS rewrite of drag.js
 */
import { offset as getOffset } from './utils/dom.js';

var WinletDrag = {
	R_DRAG_ELEMENT_TYPE: new RegExp('winletdrag_(\\S+)'),

	m_arrAreas: null,
	m_arrAreaRects: null,
	m_arrConts: null,
	m_arrContRects: null,
	m_elmMove: null,
	m_elmDropIndicate: null,
	m_elmArea: null,
	m_elmContent: null,
	m_elmContentRect: null,
	m_offsetMove: null,

	m_defaultConfig: {
		indicatorClass: "winlet_drop",
		isVertical: true,
		moveAfterDrag: true,
		showDropLocation: true,
		dragStart: function() {},
		dragEnd: function() {},
		dragged: function() {}
	},
	m_configs: {},

	config: function(group, cfg) {
		WinletDrag.m_configs[group] = Object.assign({}, WinletDrag.m_defaultConfig, cfg);
	},

	getConfig: function() {
		var group = WinletDrag.m_elmContent.drag_data_group;
		if (WinletDrag.m_configs[group] == null)
			WinletDrag.config(group, {});
		return WinletDrag.m_configs[group];
	},

	initArrObjects: function(elm) {
		if (elm == null) return;

		var m = elm.className.match(WinletDrag.R_DRAG_ELEMENT_TYPE);

		if (m != null) {
			elm.drag_element_type = m[1];
			elm.drag_data_group = elm.getAttribute("data-drag-group");

			if (elm.drag_element_type == 'area') {
				WinletDrag.m_arrAreas.push(elm);
				WinletDrag.m_arrAreaRects.push(WinletDrag.getRect(elm));
				elm.container = WinletDrag.getElement(elm, "cont");
			}
			if (elm.drag_element_type == 'cont') {
				WinletDrag.m_arrConts.push(elm);
				WinletDrag.m_arrContRects.push(WinletDrag.getRect(elm));
			}
		}

		for (var i = 0; i < elm.children.length; i++)
			WinletDrag.initArrObjects(elm.children[i]);
	},

	initAreasAndContents: function() {
		WinletDrag.m_arrAreas = [];
		WinletDrag.m_arrAreaRects = [];
		WinletDrag.m_arrConts = [];
		WinletDrag.m_arrContRects = [];
		WinletDrag.initArrObjects(window.document.body);
	},

	getRect: function(elm) {
		var o = getOffset(elm);
		return {
			top: o.top,
			left: o.left,
			width: elm.offsetWidth,
			height: elm.offsetHeight,
			bottom: o.top + elm.offsetHeight,
			right: o.left + elm.offsetWidth
		};
	},

	getPosiRect: function(elm) {
		return {
			top: elm.offsetTop,
			left: elm.offsetLeft,
			width: elm.offsetWidth,
			height: elm.offsetHeight,
			bottom: elm.offsetTop + elm.offsetHeight,
			right: elm.offsetLeft + elm.offsetWidth
		};
	},

	clearSelection: function() {
		try {
			if (window.getSelection) {
				if (window.getSelection().empty)
					window.getSelection().empty();
				else if (window.getSelection().removeAllRanges)
					window.getSelection().removeAllRanges();
			}
		} catch (e) {}
	},

	newRect: function(top, left, bottom, right) {
		return { top: top, left: left, bottom: bottom, right: right, width: right - left, height: bottom - top };
	},

	getElement: function(elm, type, group) {
		if (!type) return null;
		while (elm) {
			if (elm.drag_element_type == type && (group == undefined || group == null || elm.drag_data_group == group))
				return elm;
			elm = elm.parentNode;
		}
		return null;
	},

	findArea: function(x, y, group) {
		for (var i = WinletDrag.m_arrAreaRects.length - 1; i >= 0; i--) {
			if (x >= WinletDrag.m_arrAreaRects[i].left && x <= WinletDrag.m_arrAreaRects[i].right
				&& y >= WinletDrag.m_arrAreaRects[i].top && y <= WinletDrag.m_arrAreaRects[i].bottom
				&& (group == undefined || group == null || WinletDrag.m_arrAreas[i].drag_data_group == group))
				return WinletDrag.m_arrAreas[i];
		}
		return null;
	},

	findCont: function(x, y, group) {
		for (var i = WinletDrag.m_arrContRects.length - 1; i >= 0; i--) {
			if (x >= WinletDrag.m_arrContRects[i].left && x <= WinletDrag.m_arrContRects[i].right
				&& y >= WinletDrag.m_arrContRects[i].top && y <= WinletDrag.m_arrContRects[i].bottom
				&& (group == undefined || group == null || WinletDrag.m_arrConts[i].drag_data_group == group))
				return i;
		}
		return null;
	},

	doMouseDown: function(event) {
		if (event.which != 1) return;

		WinletDrag.initAreasAndContents();

		WinletDrag.m_elmContent = WinletDrag.getElement(event.target, "cont");
		if (WinletDrag.m_elmContent == null) return;
		WinletDrag.m_elmArea = WinletDrag.getElement(WinletDrag.m_elmContent, "area", WinletDrag.m_elmContent.drag_data_group);

		WinletDrag.getConfig().dragStart(WinletDrag.m_elmContent);

		WinletDrag.m_elmContentRect = WinletDrag.getRect(WinletDrag.m_elmContent);
		var rectContent = WinletDrag.getPosiRect(WinletDrag.m_elmContent);

		var moveDiv = document.createElement("div");
		moveDiv.appendChild(WinletDrag.m_elmContent.cloneNode(true));
		moveDiv.classList.add("winlet_drag");
		moveDiv.style.left = rectContent.left + "px";
		moveDiv.style.top = rectContent.top + "px";
		moveDiv.style.width = rectContent.width + "px";
		WinletDrag.m_elmMove = moveDiv;

		WinletDrag.m_offsetMove = {
			x: rectContent.left - event.pageX,
			y: rectContent.top - event.pageY
		};

		WinletDrag.m_elmContent.parentNode.appendChild(WinletDrag.m_elmMove);
		WinletDrag.m_elmContent.style.opacity = '0.5';
		WinletDrag.m_elmMove.style.opacity = '0.5';

		WinletDrag.clearSelection();
	},

	findDropLocation: function(x, y) {
		var location = {};
		location.area = WinletDrag.findArea(x, y, WinletDrag.m_elmContent.drag_data_group);
		if (location.area == null)
			return null;

		var contIdx = WinletDrag.findCont(x, y, WinletDrag.m_elmContent.drag_data_group);

		if (contIdx != null && WinletDrag.m_arrConts[contIdx] != location.area.container) {
			location.content = WinletDrag.m_arrConts[contIdx];
			if (WinletDrag.getConfig().isVertical)
				location.before = y < WinletDrag.m_arrContRects[contIdx].top + WinletDrag.m_arrContRects[contIdx].height / 2;
			else
				location.before = x < WinletDrag.m_arrContRects[contIdx].left + WinletDrag.m_arrContRects[contIdx].width / 2;
		}

		return location;
	},

	showDropPoint: function(x, y) {
		if (WinletDrag.m_elmDropIndicate != null)
			WinletDrag.m_elmDropIndicate.remove();

		var location = WinletDrag.findDropLocation(x, y);
		if (location == null) return;
		if (location.content == WinletDrag.m_elmContent) return;
		if (location.content == null && location.area == WinletDrag.m_elmArea) return;

		var indicator = document.createElement(WinletDrag.m_elmContent.nodeName);
		indicator.classList.add(WinletDrag.getConfig().indicatorClass);
		WinletDrag.m_elmDropIndicate = indicator;

		if (location.content != null) {
			if (location.before)
				location.content.insertAdjacentElement('beforebegin', indicator);
			else
				location.content.insertAdjacentElement('afterend', indicator);
		} else {
			location.area.appendChild(indicator);
		}
	},

	doMouseMove: function(event) {
		if (WinletDrag.m_elmMove == null || WinletDrag.m_offsetMove == null) return;

		WinletDrag.clearSelection();

		WinletDrag.m_elmMove.style.left = (event.pageX + WinletDrag.m_offsetMove.x) + "px";
		WinletDrag.m_elmMove.style.top = (event.pageY + WinletDrag.m_offsetMove.y) + "px";

		if (WinletDrag.getConfig().showDropLocation)
			WinletDrag.showDropPoint(event.pageX, event.pageY);
	},

	doMouseUp: function(event) {
		if (WinletDrag.m_elmDropIndicate != null)
			WinletDrag.m_elmDropIndicate.remove();

		if (WinletDrag.m_elmContent != null) {
			WinletDrag.m_elmContent.style.opacity = '1.0';

			var location = WinletDrag.findDropLocation(event.pageX, event.pageY);

			if (location != null &&
				!(location.content == WinletDrag.m_elmContent) &&
				!(location.content == null && location.area == WinletDrag.m_elmArea)) {

				if (WinletDrag.getConfig().moveAfterDrag) {
					if (location.content == null)
						location.area.appendChild(WinletDrag.m_elmContent);
					else if (location.before)
						location.content.insertAdjacentElement('beforebegin', WinletDrag.m_elmContent);
					else
						location.content.insertAdjacentElement('afterend', WinletDrag.m_elmContent);
				}

				var content = WinletDrag.m_elmContent;
				// Fire after cleanup
				setTimeout(function() {
					location.area.dispatchEvent(new CustomEvent("dragged", {
						detail: { content: content, location: location },
						bubbles: true
					}));
				}, 0);

				WinletDrag.getConfig().dragged(WinletDrag.m_elmContent, location);
			} else {
				WinletDrag.getConfig().dragEnd(WinletDrag.m_elmContent, location);
			}

			WinletDrag.m_elmContent = null;
		}

		if (WinletDrag.m_elmMove != null) {
			WinletDrag.m_elmMove.remove();
			WinletDrag.m_elmMove = null;
		}
	},

	documentEventBounded: false,

	init: function(container) {
		var handles = container.querySelectorAll(".winletdrag_drag");
		handles.forEach(function(h) {
			h.style.cursor = "move";
			h.removeEventListener("mousedown", WinletDrag.doMouseDown);
			h.addEventListener("mousedown", WinletDrag.doMouseDown);
		});

		if (!WinletDrag.documentEventBounded) {
			document.addEventListener('mousemove', WinletDrag.doMouseMove);
			document.addEventListener('mouseup', WinletDrag.doMouseUp);
			WinletDrag.documentEventBounded = true;
		}
	}
};

// Auto-init on WinletWindowLoaded
document.addEventListener("WinletWindowLoaded", function(event) {
	WinletDrag.init(event.target);
});

export { WinletDrag };
