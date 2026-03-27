import { deparam } from './utils/deparam.js';
import { param } from './utils/param.js';
import { ajax } from './utils/ajax.js';
import { Deferred, whenAll } from './utils/deferred.js';
import { qs, qsa, offset, serializeForm, domReady } from './utils/dom.js';

function ElmRect(el) {
	if (el == null) return null;

	var rect = el.getBoundingClientRect();
	this.left = rect.left + window.pageXOffset;
	this.top = rect.top + window.pageYOffset;
	this.width = el.offsetWidth;
	this.height = el.offsetHeight;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;

	this.union = function(r) {
		if (r.left < this.left) this.left = r.left;
		if (r.right > this.right) this.right = r.right;
		if (r.top < this.top) this.top = r.top;
		if (r.bottom > this.bottom) this.bottom = r.bottom;
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
	};
}

var WinletJSEngine = {
	ImgBg: new Image(1, 1),
	ImgLoading: new Image(1, 1),
	ImgValidating: new Image(1, 1),

	topSpace: 0,
	bottomSpace: 0,
	leftSpace: 0,
	rightSpace: 0,

	widCounter: 0,
	isStatic: false,
	isApme: false,
	detectHashChange: true,

	reEscape: /(:|\.|\[|\])/g,
	reScriptAll: new RegExp('<script.*?>(?:\n|\r|.)*?<\/script>', 'img'),
	reScriptOne: new RegExp('<script(.*?)>((?:\n|\r|.)*?)<\/script>', 'im'),
	reScriptLanguage: new RegExp('.*?language.*?=.*?"(.*?)"', 'im'),
	reScriptSrc: new RegExp('.*?src.*?=.*?"(.*?)"', 'im'),
	reScriptType: new RegExp('.*?type.*?=.*?"(.*?)"', 'im'),
	reScriptCharset: new RegExp('.*?charset.*?=.*?"(.*?)"', 'im'),
	reCSSAll: new RegExp('<link.*?type="text/css".*?>', 'img'),
	reCSSHref: new RegExp('.*?href="(.*?)"', 'im'),
	reWinWinlet: new RegExp('win\\$\\.winlet\\s*\\(', 'img'),
	reWinContainer: new RegExp('win\\$\\.container\\s*\\(', 'img'),
	reWinPost: new RegExp('win\\$\\.post\\s*\\(', 'img'),
	reWinPostEmpty: new RegExp('win\\$\\.post\\s*\\(\\s*\\)', 'img'),
	reWinEmbed: new RegExp('win\\$\\.embed\\s*\\(', 'img'),
	reWinInclude: new RegExp('win\\$\\.include\\s*\\(', 'img'),
	reWinAjax: new RegExp('win\\$\\.ajax\\s*\\(', 'img'),
	reWinGet: new RegExp('win\\$\\.get\\s*\\(', 'img'),
	reWinToggle: new RegExp('win\\$\\.toggle\\s*\\(', 'img'),
	reWinUrl: new RegExp('win\\$\\.url\\s*\\(', 'img'),
	reWinSubmit: new RegExp('win\\$\\.submit\\s*\\(', 'img'),
	reWinFind: new RegExp('win\\$\\.find\\s*\\(', 'img'),
	reWinWait: new RegExp('win\\$\\.wait\\s*\\(', 'img'),
	reWinAfterSubmit: new RegExp('win\\$\\.aftersubmit\\s*\\(', 'img'),
	reWinlet: new RegExp('^\\s*(((/\\w+)?/.+/)\\w+)(\\?([^\\s]+))?(\\s+(.*?))?$'),
	reWinletParam: new RegExp('(\\w+)\\:(\\w+)'),
	reDialogSetting: new RegExp('<div id="winlet_dialog"[^>]*>(.*?)<\/div>', 'img'),
	reWinletHeader: new RegExp('<div id="winlet_header"[^>]*>(.*?)<\/div>', 'img'),
	reMetaTitle: new RegExp('<meta\\s+name\\s*=\\s*"\\s*title\\s*"\\s+content=\\s*"([^"]+)"[^>]*>'),
	reMeta: new RegExp('<meta\\s+(name|property)\\s*=\\s*"[^"]*"\\s+content=\\s*"[^"]+"[^>]*>'),
	reAction: new RegExp('^(.*)\\?_a=(.*)$'),

	form: {
		createResultHolder: function(input) {
			if (input.m_result != null)
				return input.m_result;
			if (input.name) {
				var escapedName = input.name.replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");
				input.m_result = input.form.querySelector("span.validate_result[data-input='" + escapedName + "']");
			}
			if (input.m_result == null) {
				input.m_result = document.createElement("span");
				input.m_result.className = "validate_result";
				input.insertAdjacentElement("afterend", input.m_result);
			}
		},

		getInputResult: function(input) {
			if (input instanceof HTMLElement && input.nodeType === 1) {
				// already a DOM element
			} else if (input && input.m_result) {
				// object with m_result (from applyChanges)
				return input.m_result;
			} else {
				return null;
			}

			if (input.m_result == null)
				WinletJSEngine.form.createResultHolder(input);

			return input.m_result;
		},

		updateValidate: function(form) {
			if (form instanceof HTMLElement && form.tagName === "FORM") {
				// ok
			} else {
				return;
			}

			if (form.updateValidate)
				form.updateValidate();
		},

		validateClearAll: function(container) {
			if (!(container instanceof HTMLElement))
				return;
			qsa("span.validate_result", container).forEach(function(el) {
				el.innerHTML = '';
			});
		},

		validateClear: function() {
			for (var i = 0; i < arguments.length; i++) {
				var result = WinletJSEngine.form.getInputResult(arguments[i]);
				if (result != null)
					result.innerHTML = '';
			}
		},

		validating: function(input) {},

		validateSuccess: function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null)
				result.innerHTML = '<span class="win_valpassed">&nbsp;</span>';
		},

		validateError: function(input, msg) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result == null) return;

			var failed = result.querySelector("div.win_valfailed");
			if (failed == null) {
				result.innerHTML = "<div class='win_valfailed'></div>";
				failed = result.querySelector("div.win_valfailed");
			}
			failed.textContent = msg;
		},

		applyChanges: function(json, form, input) {
			var changes = null;
			try {
				changes = eval(json);
			} catch (e) {}

			if (changes != null) {
				var errors = [];

				for (var i = 0; i < changes.length; i++) {
					if (changes[i].type == 's') {
						var showEl = form.querySelector(changes[i].input);
						if (showEl) showEl.style.display = '';
					} else if (changes[i].type == 'h') {
						var hideEl = form.querySelector(changes[i].input);
						if (hideEl) hideEl.style.display = 'none';
					} else {
						var inp = form.querySelector(":is(input, select, textarea)[name='" + changes[i].input + "']");

						if (inp == null)
							inp = document.getElementById(changes[i].input);

						if (changes[i].type == 'v') {
							if (changes[i].message != '') {
								if (inp != null) {
									WinletJSEngine.form.validateClear(inp);
									WinletJSEngine.form.validateError(inp, changes[i].message);
									errors.push(inp);
								} else {
									var result = form.querySelector("span.validate_result[data-input='" + changes[i].input + "']");
									if (result != null) {
										var fakeInp = { m_result: result };
										WinletJSEngine.form.validateClear(fakeInp);
										WinletJSEngine.form.validateError(fakeInp, changes[i].message);
										errors.push(result);
									}
								}
							}
						} else if (inp != null) {
							if (changes[i].type == 'u') {
								if (inp.type == 'radio') {
									var radio = form.querySelector(":is(input)[name='" + changes[i].input + "'][value='" + changes[i].value + "']");
									if (radio) radio.checked = true;
								} else if (inp.type == 'checkbox') {
									inp.checked = changes[i].value;
								} else {
									if (input == inp)
										WinletJSEngine.form.validateSuccess(input);
									inp.value = changes[i].value;
								}
							} else if (changes[i].type == 'd') {
								inp.disabled = true;
								WinletJSEngine.form.validateClear(inp);
							} else if (changes[i].type == 'e') {
								inp.disabled = false;
							} else if (changes[i].type == 'l') {
								if (inp.tagName === 'SELECT') {
									inp.innerHTML = '';
									for (var j = 0; j < changes[i].list.length; j++)
										inp.insertAdjacentHTML('beforeend',
											'<option value="' + changes[i].list[j].id + '">' + changes[i].list[j].name + '</option>');
								}
							}
						}
					}
				}

				if (errors.length > 0) {
					WinletJSEngine.ensureVisible(errors);
					try {
						errors[0].select();
						errors[0].focus();
					} catch(e) {}
				}
			}
		},

		getValidateResponseHandler: function(form, name, input) {
			return function(json) {
				WinletJSEngine.form.validateClear(input);
				WinletJSEngine.form.applyChanges(json, form, input);

				if (form.onerror != undefined && input != undefined) {
					try { form.onerror(input); } catch (e) {}
				}
			};
		},

		showTip: function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null && result.innerHTML == '')
				result.innerHTML = '<div class="win_tips">' + input.getAttribute('tips') + '</div>';
		},

		hideTip: function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null && result.querySelector("div.win_tips") != null)
				result.innerHTML = '';
		}
	},

	parseJson: function(str) {
		if (!str || str.trim() == '') return {};
		return JSON.parse(str);
	},

	startsWith: function(str, w) {
		return str != null && typeof str == 'string' && w && str.slice(0, w.length) == w;
	},

	endsWith: function(str, w) {
		return str != null && typeof str == 'string' && w && str.slice(-w.length) == w;
	},

	_utf8_decode: function(utftext) {
		if (utftext == null) return null;
		utftext = unescape(utftext);
		var string = "";
		var i = 0;
		var c, c2, c3;
		c = c2 = 0;

		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	},

	useSessionStorage: null,

	canUseSessionStorage: function() {
		if (WinletJSEngine.useSessionStorage == null) {
			WinletJSEngine.useSessionStorage = false;
			if (typeof(sessionStorage) !== "undefined") {
				try {
					sessionStorage.setItem("winlet_test", 1);
					sessionStorage.removeItem("winlet_test");
					WinletJSEngine.useSessionStorage = true;
				} catch (e) {}
			}
		}
		return WinletJSEngine.useSessionStorage;
	},

	setSessionId: function(id) {
		if (WinletJSEngine.winletDomain) {
			if (WinletJSEngine.canUseSessionStorage()) {
				sessionStorage.setItem('winlet_session_id', id);
			} else {
				document.cookie = "WINLET_SESSION_ID=" + id;
			}
		}
	},

	getSessionId: function() {
		if (WinletJSEngine.winletDomain) {
			if (WinletJSEngine.canUseSessionStorage()) {
				return sessionStorage.getItem('winlet_session_id');
			} else {
				return decodeURIComponent(document.cookie.replace(
					new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent("WINLET_SESSION_ID")
						.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
			}
		}
		return null;
	},

	getForm: function(container, name) {
		if (container == null || name == null)
			return null;

		var f = container.querySelector('form[name="' + name + '"]');
		if (f != null)
			return f;

		if (container.dlg != null)
			f = container.dlg.querySelector('form[name="' + name + '"]');
		return f;
	},

	isRootWinlet: function(winlet) {
		return winlet.getAttribute("data-winlet-url") != null && winlet.parentElement.closest("div[data-winlet-url]") == null;
	},

	getContainer: function(element) {
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
	},

	getRootWinlet: function(element) {
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
	},

	traceToWinlet: function(container) {
		if (container == null)
			return null;

		if (container.getAttribute("data-winlet-url") != null)
			return container;

		var srcId = container.dataset.winletSrcId;
		if (!srcId) return null;

		return WinletJSEngine.traceToWinlet(qs('div[data-winlet-id="' + srcId + '"]'));
	},

	getWinlet: function(element) {
		return WinletJSEngine.traceToWinlet(WinletJSEngine.getContainer(element));
	},

	getWinletUrl: function(container, url) {
		if (url && !url.indexOf("/") == 0)
			url = "/" + url;

		var pathLevel = url == null ? 0 : (url.match(/\//g) || []).length;
		if (pathLevel == 3)
			return url;

		var winlet = WinletJSEngine.traceToWinlet(container);
		if (winlet == null)
			return null;

		if (!url)
			return winlet.getAttribute("data-winlet-url");

		switch (pathLevel) {
			case 1:
				return WinletJSEngine.getWinletRoot(winlet) + url.substring(1);
			case 2:
				return WinletJSEngine.getContextRoot(winlet) + url.substring(1);
		}
		return url;
	},

	winletRootMap: {},
	getWinletRoot: function(container) {
		try {
			var url = WinletJSEngine.getWinletUrl(container);
			if (WinletJSEngine.winletRootMap[url] == null)
				WinletJSEngine.winletRootMap[url] = url.match(WinletJSEngine.reWinlet)[2];
			return WinletJSEngine.winletRootMap[url];
		} catch (e) {
			return null;
		}
	},

	contextRootMap: {},
	getContextRoot: function(container) {
		try {
			var url = WinletJSEngine.getWinletUrl(container);
			if (WinletJSEngine.contextRootMap[url] == null) {
				WinletJSEngine.contextRootMap[url] = url.match(WinletJSEngine.reWinlet)[3];
				if (WinletJSEngine.contextRootMap[url] == null)
					WinletJSEngine.contextRootMap[url] = "/";
				else
					WinletJSEngine.contextRootMap[url] = WinletJSEngine.contextRootMap[url] + "/";
			}
			return WinletJSEngine.contextRootMap[url];
		} catch (e) {
			return null;
		}
	},

	hashGroupMap: {},
	getHashGroup: function(container) {
		try {
			var url = WinletJSEngine.getWinletRoot(container);

			var parent = container.parentElement ? container.parentElement.closest("div[data-winlet-url]") : null;
			while(parent != null && WinletJSEngine.getWinletRoot(parent) == url) {
				container = parent;
				parent = container.parentElement ? container.parentElement.closest("div[data-winlet-url]") : null;
			}

			var ext = container.closest("[data-winlet-hashgroup-ext]");
			var extVal = "";
			if (ext != null) {
				extVal = ext.getAttribute("data-winlet-hashgroup-ext");
				url = url + "!" + extVal;
			}

			if (WinletJSEngine.hashGroupMap[url] == null) {
				var settings = WinletJSEngine.getWinSettings(container);
				if ('yes' == settings['root'])
					WinletJSEngine.hashGroupMap[url] = 'root';
				else {
					var count = 0;
					for (var k in WinletJSEngine.hashGroupMap) {
						if (WinletJSEngine.hashGroupMap.hasOwnProperty(k))
							++count;
					}
					WinletJSEngine.hashGroupMap[url] = (count + 1).toString() + extVal;
				}
			}
			return WinletJSEngine.hashGroupMap[url];
		} catch (e) {
			return null;
		}
	},

	getFullUrl: function(url) {
		if (WinletJSEngine.winletDomain) {
			var sid = WinletJSEngine.getSessionId();
			if (sid == null)
				return WinletJSEngine.winletDomain + url;

			var idx = url.indexOf("?");
			if (idx <= 0)
				return WinletJSEngine.winletDomain + url + ";jsessionid=" + sid;

			return WinletJSEngine.winletDomain + url.substr(0, idx) + ";jsessionid=" + sid + url.substr(idx);
		}
		return url;
	},

	getWinSettings: function(container) {
		var winlet = WinletJSEngine.traceToWinlet(container);
		if (winlet == null)
			return {};
		var settings = winlet.dataset.winletSettings;
		if (settings == null)
			return {};
		if (typeof settings == 'string' || settings instanceof String)
			return WinletJSEngine.parseJson(settings);
		return settings;
	},

	getHash: function(container) {
		var hashgroup = WinletJSEngine.getHashGroup(container);

		try {
			var hash = window.location.toString().split('#')[1];
			if (hash.indexOf("!") == 0)
				hash = hash.substring(1);
			var params = deparam(hash);

			if ('root' == hashgroup) {
				var ret = {};
				for (var p in params) {
					var include = true;
					if (!params.hasOwnProperty(p))
						include = false;

					if (include && typeof params[p] === 'object') {
						if (Object.prototype.toString.call(params[p]) !== '[object Array]')
							include = false;
						else {
							for (var i = 0; i < params[p].length; i++)
								if (typeof params[p][i] != 'string' && typeof params[p][i] != 'number') {
									include = false;
									break;
								}
						}
					}
					if (include) ret[p] = params[p];
				}
				return ret;
			} else
				return params[hashgroup];
		} catch (e) {}
		return null;
	},

	setHash: function(container, hash, toggle, replace) {
		var hashgroup = WinletJSEngine.getHashGroup(container);
		var params = null;

		try {
			var h = window.location.toString().split('#')[1];
			if (h.indexOf("!") == 0)
				h = h.substring(1);
			params = deparam(h);
		} catch (e) {}

		if (!(params instanceof Object))
			params = {};
		var owner = params;

		if (hashgroup != 'root') {
			if (params[hashgroup] == undefined)
				params[hashgroup] = {};
			owner = params[hashgroup];
		}

		if (toggle) {
			for (var property in hash) {
				if (Array.isArray(hash[property])) {
					if (!(Array.isArray(owner[property]))) {
						owner[property] = hash[property];
					} else {
						hash[property].forEach(function(value) {
							value = "" + value;
							var idx = owner[property].indexOf(value);
							if (idx < 0)
								owner[property].push(value);
							else
								owner[property].splice(idx, 1);
						});
					}
				} else {
					if (owner[property] == hash[property])
						delete owner[property];
					else
						owner[property] = hash[property];
				}
			}
		} else if (replace) {
			var current = WinletJSEngine.getHash(container);
			for (var property in current) {
				delete owner[property];
			}
			Object.assign(owner, hash);
		} else {
			Object.assign(owner, hash);
		}

		for (var property in owner) {
			if (owner[property] == '')
				delete owner[property];
		}

		WinletJSEngine.detectHashChange = false;
		var val = param(params);
		window.location.hash = "!" + val;
	},

	getParam: function(container) {
		if (container == null) return {};

		var parent = null;
		if (container.dataset.winletSrcId != null)
			parent = qs('div[data-winlet-id="' + container.dataset.winletSrcId + '"]');
		else
			parent = container.parentElement ? container.parentElement.closest("div[data-winlet-id], div[data-winlet-src-id]") : null;

		var obj = {};
		if (parent != null)
			Object.assign(obj, WinletJSEngine.getParam(parent));

		var params = container.getAttribute("data-winlet-params");
		if (params != null) {
			if (typeof params == "string")
				Object.assign(obj, WinletJSEngine.parseJson(params));
			else
				Object.assign(obj, params);
		}

		return obj;
	},

	mergeParam: function(container) {
		var obj = {};

		Object.assign(obj, WinletJSEngine.getParam(container));

		var idx = window.location.href.indexOf('?');
		if (idx > 0) {
			var queryStr = window.location.href.substr(idx + 1);
			idx = queryStr.indexOf("#");
			if (idx > 0)
				queryStr = queryStr.substr(0, idx);
			Object.assign(obj, deparam(queryStr));
		}

		try {
			Object.assign(obj, WinletJSEngine.getHash(container));
		} catch (e) {}

		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] != null)
				Object.assign(obj, arguments[i]);
		}

		return param(obj, true);
	},

	getViewport: function() {
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
	},

	getPositionInViewport: function(element) {
		var viewport = WinletJSEngine.getViewport();
		var rect = new ElmRect(element);

		rect.left = rect.left - viewport.left;
		rect.top = rect.top - viewport.top;
		rect.right = rect.right - viewport.left;
		rect.bottom = rect.bottom - viewport.top;
		rect.viewport = viewport;

		return rect;
	},

	ensureVisible: function(element) {
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
		} catch (e) {}
	},

	clearLoading: function(container) {
		try {
			if (container.loading) {
				container.loading.remove();
				container.loading = null;
			}
		} catch (e) {}
	},

	showLoading: function(container, dialog, nodelay) {
		try {
			WinletJSEngine.clearLoading(container);

			var rect = new ElmRect(container);
			try {
				if (dialog != null)
					rect = new ElmRect(dialog);
			} catch (e) {}

			if (WinletJSEngine.ImgLoading.src != null && WinletJSEngine.ImgLoading.src != '' && WinletJSEngine.ImgBg.src != null && WinletJSEngine.ImgBg.src != '') {
				var loadDiv = document.createElement("div");
				loadDiv.style.cssText = "z-index:100000;position:absolute;background:url(" + WinletJSEngine.ImgBg.src + ");left:" + rect.left + "px;top:" + rect.top + "px;width:" + rect.width + "px;height:" + rect.height + "px";
				loadDiv.innerHTML = "<table width='100%' height='100%' border='0'><tr height='100%'><td align='center' valign='middle'><img src='" + WinletJSEngine.ImgLoading.src + "'/></td></tr></table>";
				if (!nodelay)
					loadDiv.style.opacity = "0";
				document.body.appendChild(loadDiv);
				container.loading = loadDiv;

				if (!nodelay) {
					setTimeout(function() {
						if (container.loading)
							container.loading.style.opacity = "1";
					}, 2000);
				}
			}
		} catch (e) {}
	},

	procStyle: function(cont) {
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
	},

	procWinFunc: function(cont, container) {
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
	},

	procScript: function(cont, container) {
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
	},

	invokeAfterLoad: function(container) {
		if (WinletJSEngine.afterLoad) {
			try { WinletJSEngine.afterLoad(container); } catch (e) {}
		}
	},

	enableForm: function(container) {
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
	},

	updateHref: function(container) {
		qsa("a[data-winlet-href]", container).forEach(function(a) {
			var href = a.dataset.winletHref;
			if (WinletJSEngine.startsWith(href, "javascript:"))
				a.setAttribute("href", href);
			else {
				try {
					a.setAttribute("href", eval(href));
				} catch (e) {}
			}
		});
	},

	getWinletResponseHeaders: function(data, jqXHR) {
		var headers = {};
		headers.redirect = jqXHR.getResponseHeader('X-Winlet-Redirect');
		headers.update = jqXHR.getResponseHeader('X-Winlet-Update');
		headers.target = jqXHR.getResponseHeader('X-Winlet-Target');
		headers.dialog = jqXHR.getResponseHeader('X-Winlet-Dialog');
		headers.cache = jqXHR.getResponseHeader('X-Winlet-Cache');
		headers.title = WinletJSEngine._utf8_decode(jqXHR.getResponseHeader('X-Winlet-Title'));

		if (WinletJSEngine.winletDomain && data) {
			var settings = WinletJSEngine.reWinletHeader.exec(data);
			if (settings) {
				data = data.replace(WinletJSEngine.reWinletHeader, '');
				settings = JSON.parse(settings[1]);
				if (settings["X-Winlet-Redirect"]) headers.redirect = settings["X-Winlet-Redirect"];
				if (settings["X-Winlet-Update"]) headers.update = settings["X-Winlet-Update"];
				if (settings["X-Winlet-Dialog"]) headers.dialog = settings["X-Winlet-Dialog"];
				if (settings["X-Winlet-Cache"]) headers.cache = settings["X-Winlet-Cache"];
				if (settings["X-Winlet-Title"]) headers.title = settings["X-Winlet-Title"];
				if (settings["X-Winlet-Session-ID"]) WinletJSEngine.setSessionId(settings["X-Winlet-Session-ID"]);
			}
		}
		return headers;
	},

	getWindowResponseHandler: function(container, focus) {
		var winlet = WinletJSEngine.traceToWinlet(container);

		return function(data, textStatus, jqXHR) {
			var headers = WinletJSEngine.getWinletResponseHeaders(data, jqXHR);
			if (data) {
				data = data.replace(WinletJSEngine.reWinletHeader, '');
				var mtitle = data.match(WinletJSEngine.reMetaTitle);
				if (mtitle) document.title = mtitle[1];
				data = data.replace(WinletJSEngine.reMeta, '');
			}

			if (container == null) return;

			if (headers.redirect != null && headers.redirect != "") {
				location.href = headers.redirect;
				return;
			}

			var dialog = false;
			if (WinletJSEngine.isRootWinlet(container) && WinletJSEngine.getWinSettings(container).dialog == "yes") {
				dialog = true;
				WinletJSEngine.openDialog(container, data, headers.title);
			} else {
				container.innerHTML = WinletJSEngine.procStyle(WinletJSEngine
					.procWinFunc(data.replace(WinletJSEngine.reScriptAll, ''), container));
				domReady(function() {
					WinletJSEngine.enableForm(container);
					WinletJSEngine.updateHref(container);
				});
				WinletJSEngine.procScript(data, container);
			}

			WinletJSEngine.invokeAfterLoad(container);
			WinletJSEngine.clearLoading(container);
			if (winlet)
				winlet.dispatchEvent(new CustomEvent("WinletWindowLoaded", { bubbles: true }));

			if (!dialog && focus)
				WinletJSEngine.ensureVisible(container);
		};
	},

	loadContent: function(container, focus, pageRefresh, loadWhenHashChanged, isInclude) {
		var dfd = Deferred();

		var winlet = WinletJSEngine.traceToWinlet(container);
		if (winlet == null)
			return dfd.reject().promise();

		var hashParams = WinletJSEngine.getHash(winlet);
		if (!pageRefresh && loadWhenHashChanged) {
			var savedParams = winlet.hashParams;

			if (hashParams == null && savedParams == null)
				return dfd.resolve().promise();

			if (hashParams != null && savedParams != null && Object.keys(hashParams).length == Object.keys(savedParams).length) {
				var same = true;

				for (var key in hashParams) {
					if (Object.prototype.toString.call(hashParams[key]) === '[object Array]') {
						if (Object.prototype.toString.call(savedParams[key]) !== '[object Array]')
							same = false;
						else {
							// Compare arrays
							var a1 = hashParams[key], a2 = savedParams[key];
							if (a1.length !== a2.length) same = false;
							else {
								for (var ai = 0; ai < a1.length; ai++) {
									if (a2.indexOf(a1[ai]) < 0) { same = false; break; }
								}
							}
						}
					} else if (hashParams[key] != savedParams[key]) {
						same = false;
						break;
					}
				}

				if (same)
					return dfd.resolve().promise();
			}
		}
		winlet.hashParams = hashParams;

		WinletJSEngine.showLoading(winlet);
		var fullUrl = WinletJSEngine.getFullUrl(WinletJSEngine.getWinletUrl(winlet));
		ajax({
			type: 'POST',
			url: fullUrl,
			data: WinletJSEngine.mergeParam(winlet, {
				_x: 'y',
				_pg: window.location.pathname,
				_purl: window.location.href,
				_pr: pageRefresh ? "yes" : "no",
				_fi: isInclude ? "yes" : "no",
				_dn: WinletJSEngine.winletDomain
			}),
			success: function(data, textStatus, jqXHR) {
				WinletJSEngine.getWindowResponseHandler(winlet, focus)(data, textStatus, jqXHR);
				dfd.resolve();
			},
			error: function(req, textStatus, errorThrown) {
				WinletJSEngine.getErrorHandler(winlet)(req, textStatus, errorThrown);
				dfd.reject();
			},
			dataType: "html"
		});
		WinletJSEngine.analyticWindow(fullUrl);

		return dfd.promise();
	},

	updateWindows: function(container, wins, nofocus) {
		if (wins == null || wins == '')
			return Deferred().resolve().promise();

		var winlet = WinletJSEngine.traceToWinlet(container);

		var update = wins.split(',');
		var dfds = [];

		for (var i = 0; i < update.length; i++) {
			try {
				var ud = update[i].trim();

				if (ud == "winlet" || ud == "window") {
					dfds.push(WinletJSEngine.loadContent(winlet));
					continue;
				}

				if (ud == "parent") {
					var parent = WinletJSEngine.getWinlet(winlet.parentElement);
					if (parent != null)
						dfds.push(WinletJSEngine.loadContent(parent));
					continue;
				}

				if (ud == "root") {
					var root = WinletJSEngine.getRootWinlet(winlet);
					if (root != null)
						dfds.push(WinletJSEngine.loadContent(root));
					continue;
				}

				var focusUpdate = false;
				if (ud.indexOf("!") == 0) {
					focusUpdate = true;
					ud = ud.substring(1);
				}

				if (ud.indexOf("/") == 0)
					ud = ud.substring(1);

				if (ud.indexOf("/") >= 0)
					ud = WinletJSEngine.getContextRoot(winlet) + ud;
				else
					ud = WinletJSEngine.getWinletRoot(winlet) + ud;

				qsa('div[data-winlet-url^="' + ud + '"]').forEach(function(el) {
					dfds.push(WinletJSEngine.loadContent(el, focusUpdate && !nofocus));
				});
			} catch (e) {}
		}

		return whenAll(dfds);
	},

	getActionResponseHandler: function(container, focus) {
		var form = null;
		var funcs = null;

		for (var i = 2; i < arguments.length; i++) {
			if (arguments[i] == null) continue;
			if (Object.prototype.toString.call(arguments[i]) == '[object Array]')
				funcs = arguments[i];
			else
				form = arguments[i];
		}

		return function(data, textStatus, jqXHR) {
			var dfd = Deferred();

			var headers = WinletJSEngine.getWinletResponseHeaders(data, jqXHR);
			if (data) {
				data = data.replace(WinletJSEngine.reWinletHeader, '');
				var mtitle = data.match(WinletJSEngine.reMetaTitle);
				if (mtitle) document.title = mtitle[1];
				data = data.replace(WinletJSEngine.reMeta, '');
			}

			if (headers.redirect != null && headers.redirect != "") {
				location.href = headers.redirect;
				return dfd.resolve().promise();
			}

			if (headers.update == "page") {
				location.reload();
				return dfd.resolve().promise();
			}

			WinletJSEngine.clearLoading(container);

			if (form != null && headers.dialog != "yes" && data.indexOf("WINLET_FORM_RESP:") == 0) {
				WinletJSEngine.form.validateClearAll(form);
				WinletJSEngine.form.applyChanges(data.substr(17), form);

				if (form.onerror != undefined) {
					try { form.onerror(null); } catch (e) {}
				}
				return dfd.resolve().promise();
			}

			var d;
			if (headers.dialog != "yes")
				d = WinletJSEngine.closeDialog(container);
			else {
				d = Deferred();
				d.resolve();
				d = d.promise();
			}

			d.then(function() {
				var dataProcessed = false;
				if (funcs != null) {
					for (var fi = 0; fi < funcs.length; fi++) {
						try {
							var ret = funcs[fi](data, textStatus, jqXHR, container);
							if (ret != undefined && ret != null && !ret) {
								dataProcessed = true;
								break;
							}
						} catch (e) {
							console.error(e);
						}
					}
				}

				if (headers.dialog == "yes") {
					if (!dataProcessed)
						WinletJSEngine.openDialog(container, data, headers.title);
				} else {
					if (!dataProcessed && !(headers.cache == "yes")) {
						var targetContainer = container;
						if (headers.target == 'window' || headers.target == 'winlet')
							targetContainer = WinletJSEngine.traceToWinlet(container);

						WinletJSEngine.getWindowResponseHandler(targetContainer,
							focus && (headers.update == null || headers.update.indexOf('!') == -1))(data, textStatus, jqXHR);
					}
				}

				WinletJSEngine.updateWindows(container, headers.update)
					.then(function() { dfd.resolve(); })
					.catch(function() { dfd.reject(); });
			});

			return dfd.promise();
		};
	},

	getErrorHandler: function(container) {
		return function(req, textStatus, errorThrown) {};
	},

	isInt: function(n) {
		return n != undefined && n != null && Number(n) === n && n % 1 === 0;
	},

	getWinletDomainByScript: function(namePattern) {
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
	},

	analyticHashChanged: function() {},
	analyticWindow: function() {},
	analyticAction: function() {},
	analyticValidate: function() {},

	setup: function(settings) {
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
	},

	winletId: 1,

	init: function(settings) {
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
	},

	// Dialog methods - will be overridden by modal.js
	getDialog: function(container, createIfNotExist) { return null; },
	openDialog: function(container, content, title) {},
	closeDialog: function(container) {
		var dfd = Deferred();
		dfd.resolve();
		return dfd.promise();
	}
};

export { WinletJSEngine, ElmRect, deparam };
