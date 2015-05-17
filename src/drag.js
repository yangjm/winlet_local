/**
 * 拖动
 */
var WinletDrag = {
	R_DRAG_ELEMENT_TYPE : new RegExp('winletdrag_(\\S+)'),

	// 页面中定义了的区域及位置
	m_arrAreas: null,
	m_arrAreaRects: null,
	// 页面中定义了的内容
	m_arrConts: null,
	m_arrContRects: null,
	// 启动拖动时建立的拖动显示区，其中为被拖动内容的拷贝，拖动结束时恢复为null
	m_elmMove: null,
	// 放下位置
	m_elmDropIndicate: null,
	// 被拖动的内容 － 所属区域
	m_elmArea: null,
	// 被拖动的内容 － 内容
	m_elmContent: null,
	// 被拖动的内容 － 位置
	m_elmContentRect: null,
	// 被拖动对象的左上角坐标与光标所在位置的偏移
	m_offsetMove: null,

	m_defaultConfig: {
		indicatorClass:"winlet_drop",
		isVertical:true,
		moveAfterDrag: true,
		showDropLocation: true,
		dragStart: function(){}, // dragStart: 拖动开始，参数为被拖动的content
		dragEnd: function(){}, // dragEnd: 拖动结束，结束位置不能放置被拖动的内容。参数为被拖动的content
		dragged: function() {} // dragged: 成功拖动，第一个参数为被拖动的content，第二个参数为location对象，属性：area放下区域，content位置参考内容，before为true表示放在参考内容之前
	},
	m_configs: {},

	/**
	 * 初始化
	 */
	config: function(group, cfg) {
		WinletDrag.m_configs[group] = $.extend({}, WinletDrag.m_defaultConfig, cfg);
	},

	getConfig: function() {
		var group = WinletDrag.m_elmContent.drag_data_group;

		if (WinletDrag.m_configs[group] == null)
			WinletDrag.config(group, {});
		return WinletDrag.m_configs[group];
	},

	/**
	 * 建立WinletDrag.m_arrAreas, WinletDrag.m_arrAreaRects, WinletDrag.m_arrConts和WinletDrag.m_arrContRects
	 */
	initArrObjects: function(elm) {
		if (elm == null)
			return;

		var m = elm.className.match(WinletDrag.R_DRAG_ELEMENT_TYPE);

		if (m != null) {
			elm.drag_element_type = m[1];
			elm.drag_data_group = $(elm).attr("data-drag-group");

			if (elm.drag_element_type == 'area') {
				WinletDrag.m_arrAreas[WinletDrag.m_arrAreas.length] = elm;
				WinletDrag.m_arrAreaRects[WinletDrag.m_arrAreaRects.length] = WinletDrag.getRect(elm);
				elm.container = WinletDrag.getElement(elm, "cont");
			}
			if (elm.drag_element_type == 'cont') {
				WinletDrag.m_arrConts[WinletDrag.m_arrConts.length] = elm;
				WinletDrag.m_arrContRects[WinletDrag.m_arrContRects.length] = WinletDrag.getRect(elm);
			}
		}

		var i;
		for (i = 0; i < elm.children.length; i++)
			WinletDrag.initArrObjects(elm.children[i]);
	},

	/**
	 * 找出所有页面内容及区域，以及其位置
	 */
	initAreasAndContents: function() {
		WinletDrag.m_arrAreas = new Array();
		WinletDrag.m_arrAreaRects = new Array();
		WinletDrag.m_arrConts = new Array();
		WinletDrag.m_arrContRects = new Array();
		WinletDrag.initArrObjects(window.document.body);
	},

	/**
	 * 获取元素的offset位置
	 */
	getRect: function(elm) {
		var e = $(elm);
		var obj = e.offset();
		obj.width = e.outerWidth();
		obj.height = e.outerHeight();
		obj.bottom = obj.top + obj.height;
		obj.right = obj.left + obj.width;
		return obj;
	},

	/**
	 * 获取元素的position位置
	 */
	getPosiRect: function(elm) {
		var e = $(elm);
		var obj = e.position();
		obj.width = e.outerWidth();
		obj.height = e.outerHeight();
		obj.bottom = obj.top + obj.height;
		obj.right = obj.left + obj.width;
		return obj;
	},

	clearSelection: function() {
		try {
			if (window.getSelection) {
			  if (window.getSelection().empty) {  // Chrome
			    window.getSelection().empty();
			  } else if (window.getSelection().removeAllRanges) {  // Firefox
			    window.getSelection().removeAllRanges();
			  }
			} else if (document.selection) {  // IE?
			  document.selection.empty();
			}
		} catch(e) {
		}
	},

	/**
	 * 新建矩阵
	 */
	newRect: function(top, left, bottom, right) {
		return {top: top, left: left, bottom: bottom, right: right, width: right - left, height: bottom - top};
	},

	/**
	 * 从elm开始向上寻找drage_element_type为type的元素
	 */
	getElement: function(elm, type, group) {
		if (!type)
			return null;

		while(elm) {
			if (elm.drag_element_type == type && (group == undefined || group == null || elm.drag_data_group == group))
				return elm;
			elm = elm.parentNode;
		}
		return null;
	},

	/**
	 * 寻找包含指定位置的区域
	 */
	findArea: function(x, y, group) {
		var i;
		for (i = WinletDrag.m_arrAreaRects.length - 1; i >= 0; i--) {
			if (x >= WinletDrag.m_arrAreaRects[i].left && x <= WinletDrag.m_arrAreaRects[i].right
				&& y >= WinletDrag.m_arrAreaRects[i].top && y <= WinletDrag.m_arrAreaRects[i].bottom
				&& (group == undefined || group == null || WinletDrag.m_arrAreas[i].drag_data_group == group))
				return WinletDrag.m_arrAreas[i];
		}

		return null;
	},

	/**
	 * 寻找包含指定位置的内容
	 */
	findCont: function(x, y, group) {
		var i;
		for (i = WinletDrag.m_arrContRects.length - 1; i >= 0; i--) {
			if (x >= WinletDrag.m_arrContRects[i].left && x <= WinletDrag.m_arrContRects[i].right
				&& y >= WinletDrag.m_arrContRects[i].top && y <= WinletDrag.m_arrContRects[i].bottom
				&& (group == undefined || group == null || WinletDrag.m_arrConts[i].drag_data_group == group))
				return i;
		}

		return null;
	},

	/**
	 * 鼠标点下，判断是否落点是否属于内容，如果是则启动拖动处理
	 */
	doMouseDown: function(event) {
		if (event.which != 1)
			return;

		WinletDrag.initAreasAndContents();

		WinletDrag.m_elmContent = WinletDrag.getElement(event.target, "cont");
		if (WinletDrag.m_elmContent == null)
			return;
		WinletDrag.m_elmArea = WinletDrag.getElement(WinletDrag.m_elmContent, "area", WinletDrag.m_elmContent.drag_data_group);

		WinletDrag.getConfig().dragStart(WinletDrag.m_elmContent);

		WinletDrag.m_elmContentRect = WinletDrag.getRect(WinletDrag.m_elmContent);
		var rectContent = WinletDrag.getPosiRect(WinletDrag.m_elmContent);

		WinletDrag.m_elmMove = $("<div></div>");
		WinletDrag.m_elmMove.append($(WinletDrag.m_elmContent).clone());
		WinletDrag.m_elmMove.addClass("winlet_drag");
		WinletDrag.m_elmMove.css("left", rectContent.left);
		WinletDrag.m_elmMove.css("top", rectContent.top);
		WinletDrag.m_elmMove.css("width", rectContent.width);

		WinletDrag.m_offsetMove = new Object();
		WinletDrag.m_offsetMove.x = rectContent.left - event.pageX;
		WinletDrag.m_offsetMove.y = rectContent.top - event.pageY;

		$(WinletDrag.m_elmContent.parentNode).append(WinletDrag.m_elmMove);
		$(WinletDrag.m_elmContent).css('opacity', 0.5);
		WinletDrag.m_elmMove.css('opacity', 0.5);

		WinletDrag.clearSelection();
	},

	/**
	 * 判断放下位置
	 */
	findDropLocation: function(x, y) {
		var location = new Object();
		location.area = WinletDrag.findArea(x, y, WinletDrag.m_elmContent.drag_data_group);
		if (location.area == null)
			return null;

		contIdx = WinletDrag.findCont(x, y, WinletDrag.m_elmContent.drag_data_group);

		if (contIdx != null && WinletDrag.m_arrConts[contIdx] != location.area.container) {
			location.content = WinletDrag.m_arrConts[contIdx];
			if (WinletDrag.getConfig().isVertical)
				location.before = y < WinletDrag.m_arrContRects[contIdx].top + WinletDrag.m_arrContRects[contIdx].height / 2;
			else
				location.before = x < WinletDrag.m_arrContRects[contIdx].left + WinletDrag.m_arrContRects[contIdx].width / 2;
		}

		return location;
	},

	/**
	 * 高亮显示若拖拽在指定位置落下时，拖动内容会落入的区域
	 */
	showDropPoint: function(x, y) {
		if (WinletDrag.m_elmDropIndicate != null)
			WinletDrag.m_elmDropIndicate.remove();

		var location = WinletDrag.findDropLocation(x, y);
		if (location == null)
			return;
		if (location.content == WinletDrag.m_elmContent)
			return;
		if (location.content == null && location.area == WinletDrag.m_elmArea)
			return;

		WinletDrag.m_elmDropIndicate = $("<" + WinletDrag.m_elmContent.nodeName + "></" + WinletDrag.m_elmContent.nodeName + ">");
		WinletDrag.m_elmDropIndicate.addClass(WinletDrag.getConfig().indicatorClass);

		if (location.content != null)
			if (location.before)
				$(location.content).before(WinletDrag.m_elmDropIndicate);
			else
				$(location.content).after(WinletDrag.m_elmDropIndicate);
		else
			$(location.area).append(WinletDrag.m_elmDropIndicate);
	},

	/**
	 * 鼠标移动-拖动
	 */
	doMouseMove: function(event) {
		if (WinletDrag.m_elmMove == null || WinletDrag.m_offsetMove == null)
			return;

		WinletDrag.clearSelection();

		WinletDrag.m_elmMove.css("left", event.pageX + WinletDrag.m_offsetMove.x);
		WinletDrag.m_elmMove.css("top", event.pageY + WinletDrag.m_offsetMove.y);

		if (WinletDrag.getConfig().showDropLocation)
			WinletDrag.showDropPoint(event.pageX, event.pageY);
	},

	/**
	 * 鼠标松开，如果正在拖动则进行放下处理
	 */
	doMouseUp: function(event) {
		if (WinletDrag.m_elmDropIndicate != null)
			WinletDrag.m_elmDropIndicate.remove();

		if (WinletDrag.m_elmContent != null) {
			$(WinletDrag.m_elmContent).css('opacity', 1.0);
			
			var location = WinletDrag.findDropLocation(event.pageX, event.pageY);

			if (location != null &&
					!(location.content == WinletDrag.m_elmContent) &&
					!(location.content == null && location.area == WinletDrag.m_elmArea)) {
				if (WinletDrag.getConfig().moveAfterDrag) {
					if (location.content == null)
						$(location.area).append(WinletDrag.m_elmContent);
					else if (location.before)
						$(location.content).before(WinletDrag.m_elmContent);
					else
						$(location.content).after(WinletDrag.m_elmContent);
				}

				WinletDrag.getConfig().dragged(WinletDrag.m_elmContent, location);
			} else
				WinletDrag.getConfig().dragEnd(WinletDrag.m_elmContent, location);

			WinletDrag.m_elmContent = null;
		}

		if (WinletDrag.m_elmMove != null) {
			WinletDrag.m_elmMove.remove();;
			WinletDrag.m_elmMove = null;
		}
	}
}

$(document).on("WinletWindowLoaded", function(event) {
	var t = $(event.target).find(".winletdrag_drag");
	t.css("cursor", "move");
	t.mousedown(WinletDrag.doMouseDown);
	$(document).mousemove(WinletDrag.doMouseMove);
	$(document).mouseup(WinletDrag.doMouseUp);
});

/**
 * Context Menu
 */
(function($) {
	$.fn.WinletMenu = function(event, menu, position, space) {
		$(this).css({cursor: "context-menu"});

		var $menu = $(menu);
		if ($menu.length == 0)
			return;

		$menu.css({
			display: "none"});

		var offset = null;

		$(this).on(event, function(e) {
			$menu.data("menusrc", $(this));
			
			var posi;
			
			if (position == null)
				posi = {top: e.pageY, left: e.pageX};
			else {
				if (space == null)
					space = 0;

				rect = WinletDrag.getRect(e.target);
				if (position == "bottomleft")
					posi = {top: rect.bottom + space, left: rect.left};
				else if (position == "topright")
					posi = {top: rect.top, left: rect.right + space};
				else if (position == "bottomright")
					posi = {top: rect.bottom + space, left: rect.right + space};
				else
					posi = {top: rect.top, left: rect.left};
			}

			if (offset == null) {
				$menu.css({
					position: "absolute",
					display: "block",
					top: 0,
					left: 0});
				offset = $menu.offset();
			}

			$menu.css({
				display: "block",
				top: posi.top - offset.top,
				left: posi.left - offset.left});

			$("body")
				.off("mouseup")
				.on("mouseup", function(upevent) {
					if (upevent.target == e.target && upevent.button == 2)
						return true;

					$menu.css({
						display: "none"
						});
					$("body").off("mousedown");
					return true;
				});
			return false;
		});
	};

	/**
	 * 右键触发的context menu
	 * 
	 * menu: 要弹出的menu元素
	 * position: menu弹出的位置，相对于触发的元素。可以是topleft, topright, bottomleft或bottomright
	 * space: 近在除了topleft之外的其他弹出位置才有效：与触发元素之间的间距
	 */
	$.fn.WinletContextMenu = function(menu, position, space) {
		$(this).WinletMenu("contextmenu", menu, position, space);
	}

	/**
	 * click触发的context menu
	 */
	$.fn.WinletClickMenu = function(menu, position, space) {
		$(this).WinletMenu("click", menu, position, space);
	}
}(jQuery));
