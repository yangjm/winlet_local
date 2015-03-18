/**
 * 拖动
 */
var AeEditDrag = {
	R_DRAG_ELEMENT_TYPE : new RegExp('aedrag_(\\S+)'),

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
		indicatorClass:"ae_drop",
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
		AeEditDrag.m_configs[group] = $.extend({}, AeEditDrag.m_defaultConfig, cfg);
	},

	getConfig: function() {
		var group = AeEditDrag.m_elmContent.drag_data_group;

		if (AeEditDrag.m_configs[group] == null)
			AeEditDrag.config(group, {});
		return AeEditDrag.m_configs[group];
	},

	/**
	 * 建立AeEditDrag.m_arrAreas, AeEditDrag.m_arrAreaRects, AeEditDrag.m_arrConts和AeEditDrag.m_arrContRects
	 */
	initArrObjects: function(elm) {
		if (elm == null)
			return;

		var m = elm.className.match(AeEditDrag.R_DRAG_ELEMENT_TYPE);

		if (m != null) {
			elm.drag_element_type = m[1];
			elm.drag_data_group = $(elm).attr("data-group");

			if (elm.drag_element_type == 'area') {
				AeEditDrag.m_arrAreas[AeEditDrag.m_arrAreas.length] = elm;
				AeEditDrag.m_arrAreaRects[AeEditDrag.m_arrAreaRects.length] = AeEditDrag.getRect(elm);
				elm.container = AeEditDrag.getElement(elm, "cont");
			}
			if (elm.drag_element_type == 'cont') {
				AeEditDrag.m_arrConts[AeEditDrag.m_arrConts.length] = elm;
				AeEditDrag.m_arrContRects[AeEditDrag.m_arrContRects.length] = AeEditDrag.getRect(elm);
			}
		}

		var i;
		for (i = 0; i < elm.children.length; i++)
			AeEditDrag.initArrObjects(elm.children[i]);
	},

	/**
	 * 找出所有页面内容及区域，以及其位置
	 */
	initAreasAndContents: function() {
		AeEditDrag.m_arrAreas = new Array();
		AeEditDrag.m_arrAreaRects = new Array();
		AeEditDrag.m_arrConts = new Array();
		AeEditDrag.m_arrContRects = new Array();
		AeEditDrag.initArrObjects(window.document.body);
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
		for (i = AeEditDrag.m_arrAreaRects.length - 1; i >= 0; i--) {
			if (x >= AeEditDrag.m_arrAreaRects[i].left && x <= AeEditDrag.m_arrAreaRects[i].right
				&& y >= AeEditDrag.m_arrAreaRects[i].top && y <= AeEditDrag.m_arrAreaRects[i].bottom
				&& (group == undefined || group == null || AeEditDrag.m_arrAreas[i].drag_data_group == group))
				return AeEditDrag.m_arrAreas[i];
		}

		return null;
	},

	/**
	 * 寻找包含指定位置的内容
	 */
	findCont: function(x, y, group) {
		var i;
		for (i = AeEditDrag.m_arrContRects.length - 1; i >= 0; i--) {
			if (x >= AeEditDrag.m_arrContRects[i].left && x <= AeEditDrag.m_arrContRects[i].right
				&& y >= AeEditDrag.m_arrContRects[i].top && y <= AeEditDrag.m_arrContRects[i].bottom
				&& (group == undefined || group == null || AeEditDrag.m_arrConts[i].drag_data_group == group))
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

		AeEditDrag.initAreasAndContents();

		AeEditDrag.m_elmContent = AeEditDrag.getElement(event.target, "cont");
		if (AeEditDrag.m_elmContent == null)
			return;
		AeEditDrag.m_elmArea = AeEditDrag.getElement(AeEditDrag.m_elmContent, "area", AeEditDrag.m_elmContent.drag_data_group);

		AeEditDrag.getConfig().dragStart(AeEditDrag.m_elmContent);

		AeEditDrag.m_elmContentRect = AeEditDrag.getRect(AeEditDrag.m_elmContent);
		var rectContent = AeEditDrag.getPosiRect(AeEditDrag.m_elmContent);

		AeEditDrag.m_elmMove = $("<div></div>");
		AeEditDrag.m_elmMove.append($(AeEditDrag.m_elmContent).clone());
		AeEditDrag.m_elmMove.addClass("ae_drag");
		AeEditDrag.m_elmMove.css("left", rectContent.left);
		AeEditDrag.m_elmMove.css("top", rectContent.top);
		AeEditDrag.m_elmMove.css("width", rectContent.width);

		AeEditDrag.m_offsetMove = new Object();
		AeEditDrag.m_offsetMove.x = rectContent.left - event.pageX;
		AeEditDrag.m_offsetMove.y = rectContent.top - event.pageY;

		$(AeEditDrag.m_elmContent.parentNode).append(AeEditDrag.m_elmMove);
		$(AeEditDrag.m_elmContent).css('opacity', 0.5);
		AeEditDrag.m_elmMove.css('opacity', 0.5);

		AeEditDrag.clearSelection();
	},

	/**
	 * 判断放下位置
	 */
	findDropLocation: function(x, y) {
		var location = new Object();
		location.area = AeEditDrag.findArea(x, y, AeEditDrag.m_elmContent.drag_data_group);
		if (location.area == null)
			return null;

		contIdx = AeEditDrag.findCont(x, y, AeEditDrag.m_elmContent.drag_data_group);

		if (contIdx != null && AeEditDrag.m_arrConts[contIdx] != location.area.container) {
			location.content = AeEditDrag.m_arrConts[contIdx];
			if (AeEditDrag.getConfig().isVertical)
				location.before = y < AeEditDrag.m_arrContRects[contIdx].top + AeEditDrag.m_arrContRects[contIdx].height / 2;
			else
				location.before = x < AeEditDrag.m_arrContRects[contIdx].left + AeEditDrag.m_arrContRects[contIdx].width / 2;
		}

		return location;
	},

	/**
	 * 高亮显示若拖拽在指定位置落下时，拖动内容会落入的区域
	 */
	showDropPoint: function(x, y) {
		if (AeEditDrag.m_elmDropIndicate != null)
			AeEditDrag.m_elmDropIndicate.remove();

		var location = AeEditDrag.findDropLocation(x, y);
		if (location == null)
			return;
		if (location.content == AeEditDrag.m_elmContent)
			return;
		if (location.content == null && location.area == AeEditDrag.m_elmArea)
			return;

		AeEditDrag.m_elmDropIndicate = $("<" + AeEditDrag.m_elmContent.nodeName + "></" + AeEditDrag.m_elmContent.nodeName + ">");
		AeEditDrag.m_elmDropIndicate.addClass(AeEditDrag.getConfig().indicatorClass);

		if (location.content != null)
			if (location.before)
				$(location.content).before(AeEditDrag.m_elmDropIndicate);
			else
				$(location.content).after(AeEditDrag.m_elmDropIndicate);
		else
			$(location.area).append(AeEditDrag.m_elmDropIndicate);
	},

	/**
	 * 鼠标移动-拖动
	 */
	doMouseMove: function(event) {
		if (AeEditDrag.m_elmMove == null || AeEditDrag.m_offsetMove == null)
			return;

		AeEditDrag.clearSelection();

		AeEditDrag.m_elmMove.css("left", event.pageX + AeEditDrag.m_offsetMove.x);
		AeEditDrag.m_elmMove.css("top", event.pageY + AeEditDrag.m_offsetMove.y);

		if (AeEditDrag.getConfig().showDropLocation)
			AeEditDrag.showDropPoint(event.pageX, event.pageY);
	},

	/**
	 * 鼠标松开，如果正在拖动则进行放下处理
	 */
	doMouseUp: function(event) {
		if (AeEditDrag.m_elmDropIndicate != null)
			AeEditDrag.m_elmDropIndicate.remove();

		if (AeEditDrag.m_elmContent != null) {
			$(AeEditDrag.m_elmContent).css('opacity', 1.0);
			
			var location = AeEditDrag.findDropLocation(event.pageX, event.pageY);

			if (location != null &&
					!(location.content == AeEditDrag.m_elmContent) &&
					!(location.content == null && location.area == AeEditDrag.m_elmArea)) {
				if (AeEditDrag.getConfig().moveAfterDrag) {
					if (location.content == null)
						$(location.area).append(AeEditDrag.m_elmContent);
					else if (location.before)
						$(location.content).before(AeEditDrag.m_elmContent);
					else
						$(location.content).after(AeEditDrag.m_elmContent);
				}

				AeEditDrag.getConfig().dragged(AeEditDrag.m_elmContent, location);
			} else
				AeEditDrag.getConfig().dragEnd(AeEditDrag.m_elmContent, location);

			AeEditDrag.m_elmContent = null;
		}

		if (AeEditDrag.m_elmMove != null) {
			AeEditDrag.m_elmMove.remove();;
			AeEditDrag.m_elmMove = null;
		}
	}
}

$(document).on("AeWindowLoaded", function(event) {
	var t = $(event.target).find(".aedrag_drag");
	t.css("cursor", "move");
	t.mousedown(AeEditDrag.doMouseDown);
	$(document).mousemove(AeEditDrag.doMouseMove);
	$(document).mouseup(AeEditDrag.doMouseUp);
});

/**
 * Context Menu
 */
(function($) {
	$.fn.AeMenu = function(event, menu, position, space) {
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

				rect = AeEditDrag.getRect(e.target);
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
				.on("mouseup", function(e) {
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
	$.fn.AeContextMenu = function(menu, position, space) {
		$(this).AeMenu("contextmenu", menu, position, space);
	}

	/**
	 * click触发的context menu
	 */
	$.fn.AeClickMenu = function(menu, position, space) {
		$(this).AeMenu("click", menu, position, space);
	}
}(jQuery));
