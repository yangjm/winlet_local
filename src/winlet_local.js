if (!('win$' in window))
window.win$ = function($) {
	(function(jQuery, window, undefined) {
		"use strict";

		var matched, browser;

		jQuery.uaMatch = function(ua) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

			var platform_match = /(ipad)/.exec(ua) || /(iphone)/.exec(ua) || /(android)/.exec(ua) || [];

			return {
				browser: match[1] || "",
				version: match[2] || "0",
				platform: platform_match[0] || ""
			};
		};

		matched = jQuery.uaMatch(window.navigator.userAgent);
		browser = {};

		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
		}

		if (matched.platform) {
			browser[matched.platform] = true
		}

		// Chrome is Webkit, but Webkit is also Safari.
		if (browser.chrome) {
			browser.webkit = true;
		} else if (browser.webkit) {
			browser.safari = true;
		}

		jQuery.browser = browser;
	})($, window);

	/*
	 * jQuery hashchange event - v1.3 - 7/21/2010
	 * http://benalman.com/projects/jquery-hashchange-plugin/
	 * 
	 * Copyright (c) 2010 "Cowboy" Ben Alman Dual licensed under the MIT and GPL
	 * licenses. http://benalman.com/about/license/
	 */
	(function($, e, b) {
		var c = "hashchange",
			h = document,
			f, g = $.event.special,
			i = h.documentMode,
			d = "on" + c in e && (i === b || i > 7);

		function a(j) {
			j = j || location.href;
			return "#" + j.replace(/^[^#]*#?(.*)$/, "$1")
		}
		$.fn[c] = function(j) {
			return j ? this.bind(c, j) : this.trigger(c)
		};
		$.fn[c].delay = 50;
		g[c] = $.extend(g[c], {
			setup: function() {
				if (d) {
					return false
				}
				$(f.start)
			},
			teardown: function() {
				if (d) {
					return false
				}
				$(f.stop)
			}
		});
		f = (function() {
			var j = {},
				p, m = a(),
				k = function(q) {
					return q
				},
				l = k,
				o = k;
			j.start = function() {
				p || n()
			};
			j.stop = function() {
				p && clearTimeout(p);
				p = b
			};

			function n() {
				var r = a(),
					q = o(m);
				if (r !== m) {
					l(m = r, q);
					$(e).trigger(c)
				} else {
					if (q !== m) {
						location.href = location.href.replace(/#.*/, "") + q
					}
				}
				p = setTimeout(n, $.fn[c].delay)
			}
			$.browser.msie && !d && (function() {
				var q, r;
				j.start = function() {
					if (!q) {
						r = $.fn[c].src;
						r = r && r + a();
						q = $('<iframe tabindex="-1" title="empty"/>')
							.hide().one("load", function() {
								r || l(a());
								n()
							}).attr("src", r || "javascript:0")
							.insertAfter("body")[0].contentWindow;
						h.onpropertychange = function() {
							try {
								if (event.propertyName === "title") {
									q.document.title = h.title
								}
							} catch (s) {}
						}
					}
				};
				j.stop = k;
				o = function() {
					return a(q.location.href)
				};
				l = function(v, s) {
					var u = q.document,
						t = $.fn[c].domain;
					if (v !== s) {
						u.title = h.title;
						u.open();
						t
							&& u.write('<script>document.domain="' + t + '"<\/script>');
						u.close();
						q.location.hash = v
					}
				}
			})();
			return j
		})()
	})($, this);

	/*
	 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
	 * http://benalman.com/projects/jquery-bbq-plugin/
	 * 
	 * Copyright (c) 2010 "Cowboy" Ben Alman Dual licensed under the MIT and GPL
	 * licenses. http://benalman.com/about/license/
	 */
	(function($, r) {
		var h, n = Array.prototype.slice,
			t = decodeURIComponent,
			a = $.param,
			j, c, m, y, b = $.bbq = $.bbq || {},
			s, x, k, e = $.event.special,
			d = "hashchange",
			B = "querystring",
			F = "fragment",
			z = "elemUrlAttr",
			l = "href",
			w = "src",
			p = /^.*\?|#.*$/g,
			u, H, g, i, C, E = {};

		function G(I) {
			return typeof I === "string"
		}

		function D(J) {
			var I = n.call(arguments, 1);
			return function() {
				return J.apply(this, I.concat(n.call(arguments)))
			}
		}

		function o(I) {
			return I.replace(H, "$2")
		}

		function q(I) {
			return I.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1")
		}

		function f(K, P, I, L, J) {
			var R, O, N, Q, M;
			if (L !== h) {
				N = I.match(K ? H : /^([^#?]*)\??([^#]*)(#?.*)/);
				M = N[3] || "";
				if (J === 2 && G(L)) {
					O = L.replace(K ? u : p, "")
				} else {
					Q = m(N[2]);
					L = G(L) ? m[K ? F : B](L) : L;
					O = J === 2 ? L : J === 1 ? $.extend({}, L, Q) : $.extend({},
						Q, L);
					O = j(O);
					if (K) {
						O = O.replace(g, t)
					}
				}
				R = N[1] + (K ? C : O || !N[1] ? "?" : "") + O + M
			} else {
				R = P(I !== h ? I : location.href)
			}
			return R
		}
		a[B] = D(f, 0, q);
		a[F] = c = D(f, 1, o);
		a.sorted = j = function(J, K) {
			var I = [],
				L = {};
			$.each(a(J, K).split("&"), function(P, M) {
				var O = M.replace(/(?:%5B|=).*$/, ""),
					N = L[O];
				if (!N) {
					N = L[O] = [];
					I.push(O)
				}
				N.push(M)
			});
			return $.map(I.sort(), function(M) {
				return L[M]
			}).join("&")
		};
		c.noEscape = function(J) {
			J = J || "";
			var I = $.map(J.split(""), encodeURIComponent);
			g = new RegExp(I.join("|"), "g")
		};
		c.noEscape(",/");
		c.ajaxCrawlable = function(I) {
			if (I !== h) {
				if (I) {
					u = /^.*(?:#!|#)/;
					H = /^([^#]*)(?:#!|#)?(.*)$/;
					C = "#!"
				} else {
					u = /^.*#/;
					H = /^([^#]*)#?(.*)$/;
					C = "#"
				}
				i = !!I
			}
			return i
		};
		c.ajaxCrawlable(0);
		$.deparam = m = function(L, I) {
			var K = {},
				J = {
					"true": !0,
					"false": !1,
					"null": null
				};
			$.each(L.replace(/\+/g, " ").split("&"), function(O, T) {
				var N = T.split("="),
					S = t(N[0]),
					M, R = K,
					P = 0,
					U = S
					.split("]["),
					Q = U.length - 1;
				if (/\[/.test(U[0]) && /\]$/.test(U[Q])) {
					U[Q] = U[Q].replace(/\]$/, "");
					U = U.shift().split("[").concat(U);
					Q = U.length - 1
				} else {
					Q = 0
				}
				if (N.length === 2) {
					M = t(N[1]);
					if (I) {
						M = M && !isNaN(M) ? +M : M === "undefined" ? h : J[M] !== h ? J[M] : M
					}
					if (Q) {
						for (; P <= Q; P++) {
							S = U[P] === "" ? R.length : U[P];
							R = R[S] = P < Q ? R[S] || (U[P + 1] && isNaN(U[P + 1]) ? {} : []) : M
						}
					} else {
						if ($.isArray(K[S])) {
							K[S].push(M)
						} else {
							if (K[S] !== h) {
								K[S] = [K[S], M]
							} else {
								K[S] = M
							}
						}
					}
				} else {
					if (S) {
						K[S] = I ? h : ""
					}
				}
			});
			return K
		};

		function A(K, I, J) {
			if (I === h || typeof I === "boolean") {
				J = I;
				I = a[K ? F : B]()
			} else {
				I = G(I) ? I.replace(K ? u : p, "") : I
			}
			return m(I, J)
		}
		m[B] = D(A, 0);
		m[F] = y = D(A, 1);
		$[z] || ($[z] = function(I) {
			return $.extend(E, I)
		})({
			a: l,
			base: l,
			iframe: w,
			img: w,
			input: w,
			form: "action",
			link: l,
			script: w
		});
		k = $[z];

		function v(L, J, K, I) {
			if (!G(K) && typeof K !== "object") {
				I = K;
				K = J;
				J = h
			}
			return this.each(function() {
				var O = $(this),
					M = J || k()[(this.nodeName || "").toLowerCase()] || "",
					N = M && O.attr(M) || "";
				O.attr(M, a[L](N, K, I))
			})
		}
		$.fn[B] = D(v, B);
		$.fn[F] = D(v, F);
		b.pushState = s = function(L, I) {
			if (G(L) && /^#/.test(L) && I === h) {
				I = 2
			}
			var K = L !== h,
				J = c(location.href, K ? L : {}, K ? I : 2);
			location.href = J
		};
		b.getState = x = function(I, J) {
			return I === h || typeof I === "boolean" ? y(I) : y(J)[I]
		};
		b.removeState = function(I) {
			var J = {};
			if (I !== h) {
				J = x();
				$.each($.isArray(I) ? I : arguments, function(L, K) {
					delete J[K]
				})
			}
			s(J, 2)
		};
		e[d] = $.extend(e[d], {
			add: function(I) {
				var K;

				function J(M) {
					var L = M[F] = c();
					M.getState = function(N, O) {
						return N === h || typeof N === "boolean" ? m(L, N) : m(L, O)[N]
					};
					K.apply(this, arguments)
				}
				if ($.isFunction(I)) {
					K = I;
					return J
				} else {
					K = I.handler;
					I.handler = J
				}
			}
		})
	})($, this);

	function ElmRect(elm) {
		if (elm == null)
			return null;

		var posi = elm.offset();
		this.left = posi.left;
		this.top = posi.top;
		this.width = elm[0].offsetWidth;
		this.height = elm[0].offsetHeight;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;

		this.union = function(rect) {
			if (rect.left < this.left)
				this.left = rect.left;
			if (rect.right > this.right)
				this.right = rect.right;
			if (rect.top < this.top)
				this.top = rect.top;
			if (rect.bottom > this.bottom)
				this.bottom = rect.bottom;
			this.width = this.right - this.left;
			this.height = this.bottom - this.top;
		}
	}

	// 定义为一个对象，而不是直接将属性和方法声明为本地属性和本地方法，是为了便于在winlet_bootstrap中通过win$.engine修改属性值及方法实现
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
		reWinlet: new RegExp(
			'^\\s*(((/\\w+)?/.+/)\\w+)(\\?([^\\s]+))?(\\s+(.*?))?$'),
		reWinletParam: new RegExp('(\\w+)\\:(\\w+)'),
		reDialogSetting: new RegExp(
			'<div id="winlet_dialog"[^>]*>(.*?)<\/div>', 'img'),
		reWinletHeader: new RegExp(
			'<div id="winlet_header"[^>]*>(.*?)<\/div>', 'img'),
		reMetaTitle: new RegExp(
			'<meta\\s+name\\s*=\\s*"\\s*title\\s*"\\s+content=\\s*"([^"]+)"[^>]*>'),
		reMeta: new RegExp(
			'<meta\\s+(name|property)\\s*=\\s*"[^"]*"\\s+content=\\s*"[^"]+"[^>]*>'),
		reAction: new RegExp('^(.*)\\?_a=(.*)$'),

		form: {
			createResultHolder: function(input) {
				if (input.m_result != null)
					return input.m_result;
				if (input.name)
					input.m_result = $(input.form).find(
						"span.validate_result[data-input='" + input.name.replace("[", "\\[").replace(
							"]", "\\]").replace(".", "\\.") + "']");
				if (input.m_result == null || input.m_result.length == 0) {
					input.m_result = $('<span class="validate_result"></span>');
					$(input).after(input.m_result);
				}
			},

			/**
			 * 返回的是jQuery对象 用WinletJSEngine.form不用this是为了重载
			 * 
			 * input: input元素对象
			 */
			getInputResult: function(input) {
				if (input instanceof $ || input instanceof jQuery) {
					if (input.length == 0)
						return null;
					input = input[0];
				}

				if (input.m_result == null)
					WinletJSEngine.form.createResultHolder(input);

				return input.m_result;
			},

			updateValidate: function(form) {
				if (form instanceof $ || form instanceof jQuery)
					if (form.length > 0)
						form = form[0];
					else
						return;

				if (form.updateValidate)
					form.updateValidate();
			},

			validateClearAll: function(container) {
				var $container = (container instanceof $ || container instanceof jQuery) ? container : $(container);
				$container.find("span.validate_result").each(function() {
					$(this).html('');
				});
			},

			validateClear: function() {
				for (var i = 0; i < arguments.length; i++) {
					var result = WinletJSEngine.form
						.getInputResult(arguments[i]);
					if (result != null)
						result.html('');
				}
			},

			validating: function(input) {},

			validateSuccess: function(input) {
				var result = WinletJSEngine.form.getInputResult(input);
				if (result != null)
					result.html('<span class="win_valpassed">&nbsp;</span>');
			},

			validateError: function(input, msg) {
				var result = WinletJSEngine.form.getInputResult(input);

				if (result == null)
					return;

				var failed = result.find("div.win_valfailed");
				if (failed.length == 0) {
					result.html("<div class='win_valfailed'></div>");
					failed = result.find("div.win_valfailed");
				}

				failed.text(msg);
			},

			applyChanges: function(json, form, input) {
				var changes = null;
				try {
					changes = eval(json);
				} catch (e) {}

				if (changes != null) {
					var errors = [];

					for (var i = 0; i < changes.length; i++) {
						if (changes[i].type == 's') { // show
							$(form).find(changes[i].input).show();
						} else if (changes[i].type == 'h') { // hide
							$(form).find(changes[i].input).hide();
						} else {
							var inp = $(form).find(
								":input[name='" + changes[i].input + "']");

							if (inp.length == 0)
								inp = $("#" + changes[i].input);

							if (inp.length == 0)
								inp = null;
							else
								inp = inp[0];

							if (changes[i].type == 'v') { // 校验结果
								if (changes[i].message != '') {
									if (inp != null) {
										WinletJSEngine.form.validateClear(inp);
										WinletJSEngine.form.validateError(inp,
											changes[i].message);
										errors.push($(inp));
									} else {
										// 校验结果只要有容器存在就可以设置，不一定要有对应的input
										var result = $(form).find(
											"span.validate_result[data-input='" + changes[i].input + "']");
										if (result.length > 0) {
											inp = {
												m_result: result
											};

											WinletJSEngine.form.validateClear(inp);
											WinletJSEngine.form.validateError(inp,
												changes[i].message);
											errors.push(result);
										}
									}
								}
							} else if (inp != null) {
								if (changes[i].type == 'u') { // 更新值
									if (inp.type == 'radio')
										$(form).children(
											":input[name='" + changes[i].input + "'][value='" + changes[i].value + "']")
										.attr('checked', 'checked');
									else if (inp.type == 'checkbox')
										inp.checked = changes[i].value;
									else {
										if (input == inp)
											WinletJSEngine.form
											.validateSuccess(input);
										$(inp).val(changes[i].value);
									}
								} else if (changes[i].type == 'd') {
									inp.disabled = true;
									WinletJSEngine.form.validateClear(inp);
								} else if (changes[i].type == 'e') {
									inp.disabled = false;
								} else if (changes[i].type == 'l') { // 更新列表
									if (inp.type = 'select') {
										$(inp).empty();
										for (var j = 0; j < changes[i].list.length; j++)
											$(inp)
											.append(
												'<option value="' + changes[i].list[j].id + '">' + changes[i].list[j].name + '</option>');
									}
								}
							}
						}
					}

					if (errors.length > 0) {
						WinletJSEngine.ensureVisible(errors);
						errors[0].select().focus();
					}
				}
			},

			getValidateResponseHandler: function(form, name, input) {
				return function(json) {
					WinletJSEngine.form.validateClear(input);

					WinletJSEngine.form.applyChanges(json, form, input);

					if (form.onerror != undefined && input != undefined) {
						try {
							form.onerror(input);
						} catch (e) {}
					}
				};
			},

			showTip: function(input) {
				var result = WinletJSEngine.form.getInputResult(input);
				if (result != null && result.html() == '')
					result.html('<div class="win_tips">' + $(this).attr('tips') + '</div>');
			},

			hideTip: function(input) {
				var result = WinletJSEngine.form.getInputResult(input);
				if (result != null && result.find("div.win_tips").length > 0)
					result.html('');
			}
		},

		parseJson: function(str) {
			if (!str || str.trim() == '')
				return {};

			if (JSON)
				return JSON.parse(str);
			return eval(str);
		},

		startsWith: function(str, w) {
			return str != null && typeof str == 'string' && w && str.slice(0, w.length) == w;
		},

		endsWith: function(str, w) {
			return str != null && typeof str == 'string' && w && str.slice(-w.length) == w;
		},

		_utf8_decode: function(utftext) {
			if (utftext == null)
				return null;

			utftext = unescape(utftext);

			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

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

		// iPhone private mode browsing不允许写入sessionStorage
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
			// 只有在Cross Domain时才需要保存和获取SessionId
			if (WinletJSEngine.winletDomain) {
				if (WinletJSEngine.canUseSessionStorage()) {
					sessionStorage.setItem('winlet_session_id', id);
				} else {
					// 不支持sessionStorage, 只能用cookie保存ID。存在安全隐患
					document.cookie = "WINLET_SESSION_ID=" + id;
				}
			}
		},

		getSessionId: function() {
			if (WinletJSEngine.winletDomain) {
				if (WinletJSEngine.canUseSessionStorage()) {
					return sessionStorage.getItem('winlet_session_id');
				} else {
					// 不支持sessionStorage, 只能用cookie保存ID
					return decodeURIComponent(document.cookie.replace(
						new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent("WINLET_SESSION_ID")
							.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
				}
			}

			return null;
		},

		getForm: function($container, name) {
			if ($container == null || name == null || $container.length == 0)
				return null;

			var f = $container.find('form[name="' + name + '"]');
			if (f != null && f.length > 0)
				return f;

			if ($container[0].dlg != null) // 如果$container是winlet而且有打开的对话框，在对话框中找
				f = $container[0].dlg.find('form[name="' + name + '"]');
			return f;
		},

		isRootWinlet: function($winlet) {
			return $winlet.attr("data-winlet-url") != null && $winlet.parent().closest("div[data-winlet-url]").length == 0;
		},

		getContainer: function(element) {
			if (element == null)
				return null;

			var $container = null;

			if (typeof element === "number")
				$container = $('div[data-winlet-id="' + element + '"]');
			else if (typeof element === "string" && element.match(/^\d+$/))
				$container = $('div[data-winlet-id="' + element + '"]');
			else if (element instanceof $ || element instanceof jQuery)
				$container = element.closest("div[data-winlet-id]");
			else
				$container = $(element).closest("div[data-winlet-id]");

			if ($container.length != 1)
				return null;

			// 返回的container可以是容器或者winlet
			return $container;
		},

		getRootWinlet: function(element) {
			var $winlet = null;
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return $winlet;
			if ($container.attr("data-winlet-url") != null)
				$winlet = $container;
			var $parent = $container.parent().closest("div[data-winlet-url]");
			if ($parent.length == 0)
				return $winlet;
			do {
				$winlet = $parent;
				$parent = $winlet.parent().closest("div[data-winlet-url]")
			} while($parent.length > 0);
			return $winlet;
		},

		traceToWinlet: function($container) {
			if ($container == null || $container.length == 0)
				return null;

			if ($container.attr("data-winlet-url") != null)
				return $container;

			return WinletJSEngine.traceToWinlet($('div[data-winlet-id="' + $container.data("winlet-src-id") + '"]'));
		},

		getWinlet: function(element) {
			return WinletJSEngine.traceToWinlet(WinletJSEngine
				.getContainer(element));
		},

		getWinletUrl: function($container, url) {
			if (url && !url.indexOf("/") == 0)
				url = "/" + url;

			var pathLevel = url == null ? 0 : (url.match(/\//g) || []).length;
			if (pathLevel == 3)
				return url;

			var $winlet = WinletJSEngine.traceToWinlet($container);
			if ($winlet == null)
				return null;

			if (!url)
				return $winlet.attr("data-winlet-url");

			switch (pathLevel) {
				case 1:
					return WinletJSEngine.getWinletRoot($winlet) + url.substring(1);
					break;
				case 2:
					return WinletJSEngine.getContextRoot($winlet) + url.substring(1);
					break;
			}

			return url;
		},

		// winlet root
		// 对于winlet "/contextroot/winleturl/windowname"，winlet root是
		// "/contextroot/winleturl/"
		// 对于winlet "/winleturl/windowname"，winlet root是 "/winleturl/"
		winletRootMap: {},
		getWinletRoot: function($container) {
			try {
				var url = WinletJSEngine.getWinletUrl($container);
				if (WinletJSEngine.winletRootMap[url] == null)
					WinletJSEngine.winletRootMap[url] = url
					.match(WinletJSEngine.reWinlet)[2];
				return WinletJSEngine.winletRootMap[url];
			} catch (e) {
				return null;
			}
		},

		// context root - 对于winlet "/contextroot/winleturl/windowname"，winlet
		// root是
		// "/contextroot/"
		contextRootMap: {},
		getContextRoot: function($container) {
			try {
				var url = WinletJSEngine.getWinletUrl($container);
				if (WinletJSEngine.contextRootMap[url] == null) {
					WinletJSEngine.contextRootMap[url] = url
						.match(WinletJSEngine.reWinlet)[3];
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
		getHashGroup: function($container) {
			try {
				var url = WinletJSEngine.getWinletRoot($container);

				// 如果子窗口的winletRoot和父窗口的winletRoot相同，则用父窗口的设置
				var $parent = $container.parent().closest("div[data-winlet-url]");
				while($parent.length > 0 && WinletJSEngine.getWinletRoot($parent) == url) {
					$container = $parent;
					$parent = $container.parent().closest("div[data-winlet-url]");
				}

				var ext = $container.closest("[data-winlet-hashgroup-ext]");
				if (ext.length == 1) {
					ext = ext.attr("data-winlet-hashgroup-ext");
					url = url + "!" + ext;
				} else
					ext = "";

				if (WinletJSEngine.hashGroupMap[url] == null) {
					var settings = WinletJSEngine.getWinSettings($container);
					if ('yes' == settings['root'])
						WinletJSEngine.hashGroupMap[url] = 'root';
					else {
						var count = 0;
						for (var k in WinletJSEngine.hashGroupMap) {
							if (WinletJSEngine.hashGroupMap.hasOwnProperty(k)) {
								++count;
							}
						}

						WinletJSEngine.hashGroupMap[url] = (count + 1).toString() + ext;
					}
				}

				return WinletJSEngine.hashGroupMap[url];
			} catch (e) {
				alert(e);
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

		getWinSettings: function($container) {
			var $winlet = WinletJSEngine.traceToWinlet($container);
			if ($winlet == null)
				return {};
			var settings = $winlet.data("winlet-settings");
			if (settings == null)
				return {};
			if (typeof settings == 'string' || settings instanceof String)
				return WinletJSEngine.parseJson(settings);
			return settings;
		},

		getHash: function($container) {
			var hashgroup = WinletJSEngine.getHashGroup($container);

			try {
				var hash = window.location.toString().split('#')[1];
				if (hash.indexOf("!") == 0)
					hash = hash.substring(1);
				var params = $.deparam(hash);

				if ('root' == hashgroup) {
					var ret = {};
					for (var p in params) {
						var include = true;

						if (!params.hasOwnProperty(p))
							include = false;

						if (include && typeof params[p] === 'object') {
							if (Object.prototype.toString.call(params[p]) !== '[object Array]') // 只能包含数组对象，其他类型的对象不包含
								include = false;
							else {
								// 数组中的值只能是数字或字符串
								for (var i = 0; i < params[p].length; i++)
									if (typeof params[p][i] != 'string' && typeof params[p][i] != 'number') {
										include = false;
										break;
									}
							}
						}

						if (include)
							ret[p] = params[p];
					}
					return ret;
				} else
					return params[hashgroup];
			} catch (e) {}

			return null;
		},

		setHash: function($container, hash, toggle, replace) {
			var hashgroup = WinletJSEngine.getHashGroup($container);
			var params = null;

			try {
				var h = window.location.toString().split('#')[1];
				if (h.indexOf("!") == 0)
					h = h.substring(1);
				params = $.deparam(h);
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
				for (property in hash) {
					if ($.isArray(hash[property])) { // array property
						if (!($.isArray(owner[property]))) { // not array in
							// hash, replace
							// directly
							owner[property] = hash[property];
						} else { // array in hash as well
							$.each(hash[property], function(index, value) {
								value = "" + value;
								var idx = $.inArray(value, owner[property]);
								if (idx < 0) // value not in hash array, add
									owner[property].push(value);
								else
								// value already in hash array, remove
									owner[property].splice(idx, 1);
							});
						}
					} else { // not array
						if (owner[property] == hash[property])
							delete owner[property];
						else
							owner[property] = hash[property];
					}
				}
			} else if (replace) {
				// 先清除现有的property
				// 调用getHash()重用其中识别root参数的逻辑
				var current = WinletJSEngine.getHash($container);
				for (property in current) {
					delete owner[property];
				}
				$.extend(owner, hash);
			} else {
				$.extend(owner, hash);
			}

			for (property in owner) {
				if (owner[property] == '')
					delete owner[property];
			}

			WinletJSEngine.detectHashChange = false;
			var val = $.param(params);
			// hash set to empty string cause page scroll up to top, set it to
			// #!
			// to prevent this behavior
			window.location.hash = "!" + val;
		},

		// 获取容器以及上级容器中定义的所有的参数的合集。越远的容器的参数优先级越低。
		getParam: function($container) {
			if ($container == null || $container.length == 0)
				return {};

			var $parent = null;
			if ($container.data("winlet-src-id") != null) // $container是容器窗口或者连接窗口，跟随data-winlet-src-id找到上层容器或winlet
				$parent = $('div[data-winlet-id="' + $container.data("winlet-src-id") + '"]');
			else
			// $container是winlet。winlet可能包含在容器中、Winlet中或者连接窗口中
				$parent = $container.parent().closest(
				"div[data-winlet-id], div[data-winlet-src-id]");

			var obj = {};
			if ($parent.length > 0)
				$.extend(obj, WinletJSEngine.getParam($parent));

			var params = $container.attr("data-winlet-params");
			if (params != null) {
				if (typeof params == "string")
					$.extend(obj, WinletJSEngine.parseJson(params));
				else
					$.extend(obj, params);
			}

			return obj;
		},

		// 合并参数，优先级从高到低为：指定的参数，hash参数，get参数，container追溯获得的所有参数
		mergeParam: function($container) {
			var obj = {};

			$.extend(obj, WinletJSEngine.getParam($container));

			var idx = window.location.href.indexOf('?');
			if (idx > 0) {
				var queryStr = window.location.href.substr(idx + 1);
				idx = queryStr.indexOf("#");
				if (idx > 0)
					queryStr = queryStr.substr(0, idx);
				$.extend(obj, $.deparam(queryStr));
			}

			try {
				$.extend(obj, WinletJSEngine.getHash($container));
			} catch (e) {}

			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i] != null)
					$.extend(obj, arguments[i]);
			}

			return $.param(obj, true);
		},

		/**
		 * 计算窗口可见区域的坐标
		 */
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

			if (rect.width < 0)
				rect.width = 0;
			if (rect.height < 0)
				rect.height = 0;

			rect.bottom = rect.top + rect.height;
			rect.right = rect.left + rect.width;

			return rect;
		},

		/**
		 * 计算element在可见区域内的坐标
		 * 
		 * left, top - element左上角在可见区域中的坐标 width, height - element的宽高 vwidth,
		 * vheight - 可见区域的宽高
		 * 
		 * @param element
		 */
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

		/**
		 * @param element
		 *            可以为单个jquery对象，或者jquery对象数组
		 */
		ensureVisible: function(element) {
			try {
				var doc = document.documentElement;
				var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
				var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

				var rect = {};

				if (Object.prototype.toString.call(element) === '[object Array]') {
					if (element.length == 0)
						return;
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
					if (scrollY != 0)
						$('html,body').stop().animate({
							scrollTop: '+=' + scrollY
						}, 500);
					if (scrollX != 0)
						$('html,body').stop().animate({
							scrollLeft: '+=' + scrollX,
						}, 500);
					// window.scrollBy(scrollX, scrollY);
				}
			} catch (e) {}
		},

		clearLoading: function($container) {
			try {
				if ($container[0].loading) {
					$container[0].loading.remove();
					$container[0].loading = null;
				}
			} catch (e) {}
		},

		showLoading: function($container, dialog, nodelay) {
			try {
				WinletJSEngine.clearLoading($container);

				var rect = new ElmRect($container);
				try {
					if (dialog != null)
						rect = new ElmRect(dialog);
				} catch (e) {}

				if (WinletJSEngine.ImgLoading.src != null && WinletJSEngine.ImgLoading.src != '' && WinletJSEngine.ImgBg.src != null && WinletJSEngine.ImgBg.src != '') {
					// 如果图片不存在，img src=''会导致对页面的访问。因此图片不存在时不显示loading
					$container[0].loading = $("<div style='z-index:100000;position:absolute;background:url(" + WinletJSEngine.ImgBg.src + ");left:" + rect.left + "px;top:" + rect.top + "px;width:" + rect.width + "px;height:" + rect.height + "px'><table width='100%' height='100%' border='0'><tr height='100%'><td align='center' valign='middle'><img src='" + WinletJSEngine.ImgLoading.src + "'/></td></tr></table></div>");
					if (!(nodelay))
						$container[0].loading.css("opacity", "0");
					$container[0].loading.appendTo("body");

					// 如果请求能在2秒中内完成，就不要让用户看见loading
					if (!(nodelay)) {
						setTimeout(function() {
							if ($container[0].loading)
								$container[0].loading.css("opacity", "1");
						}, 2000);
					}
				}
			} catch (e) {}
		},

		procStyle: function(cont) {
			var css = cont.match(WinletJSEngine.reCSSAll) || [];
			var cssHref = $.map(css, function(tag) {
				return (tag.match(WinletJSEngine.reCSSHref) || ['', ''])[1];
			});

			var elmHead = document.getElementsByTagName("head")[0];
			var elmLinks = elmHead.getElementsByTagName("link");
			var i;
			var j;
			var newCss;

			for (i = 0; i < cssHref.length; i++) {
				if (cssHref[i] == "")
					continue;

				for (j = 0; j < elmLinks.length; j++) {
					if (elmLinks[j].href == cssHref[i])
						break;
				}

				if (j < elmLinks.length)
					continue;

				newCss = document.createElement('link');
				newCss.type = 'text/css';
				newCss.rel = 'stylesheet';
				newCss.href = cssHref[i];
				newCss.media = 'screen';
				elmHead.appendChild(newCss);
			}

			return cont.replace(WinletJSEngine.reCSSAll, '');
		},

		procWinFunc: function(cont, $container) {
			var containerId = $container.data("winlet-id");
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

		procScript: function(cont, $container) {
			var containerId = $container.data("winlet-id");
			if (containerId = null)
				return null;
			var scripts = cont.match(WinletJSEngine.reScriptAll) || [];
			var scriptContent = $.map(scripts, function(scriptTag) {
				return (scriptTag.match(WinletJSEngine.reScriptOne) || ['',
					'', ''
				])[2];
			});
			var scriptDef = $.map(scripts, function(scriptTag) {
				return (scriptTag.match(WinletJSEngine.reScriptOne) || ['',
					'', ''
				])[1];
			});
			var scriptLanguage = $.map(scriptDef, function(scriptTag) {
				return (scriptTag.match(WinletJSEngine.reScriptLanguage) || [
					'', ''
				])[1];
			});
			var scriptSrc = $
				.map(scriptDef,
					function(scriptTag) {
						return (scriptTag
							.match(WinletJSEngine.reScriptSrc) || [
								'', ''
							])[1];
					});
			var scriptType = $.map(scriptDef, function(scriptTag) {
				return (scriptTag.match(WinletJSEngine.reScriptType) || ['',
					''
				])[1];
			});
			var scriptCharset = $.map(scriptDef, function(scriptTag) {
				return (scriptTag.match(WinletJSEngine.reScriptCharset) || [
					'', ''
				])[1];
			});

			var elmHead = document.getElementsByTagName("head")[0];
			var elmScripts = $("script");
			var i;
			var j;
			var ret = [];

			for (i = 0; i < scripts.length; i++) {
				if (scriptSrc[i] == "")
					continue;

				for (j = 0; j < elmScripts.length; j++) {
					if (elmScripts[j].src == scriptSrc[i])
						break;
				}

				if (j < elmScripts.length)
					continue;

				var dfd = $.Deferred();

				var newScript = document.createElement('script');
				if (scriptType[i] != "")
					newScript.type = scriptType[i];
				else if (scriptLanguage[i] != "")
					newScript.type = "text/" + scriptLanguage[i];
				else
					newScript.type = "text/javascript";
				if (scriptCharset[i] != "")
					newScript.charset = scriptCharset[i];

				$(newScript).load(function() {
					dfd.resolve();
				}).on('readystatechange', function() {
					if (newScript.readyState == 'loaded') {
						dfd.resolve();
					}
				});

				elmHead.appendChild(newScript);
				newScript.src = scriptSrc[i];
				ret[ret.length] = dfd.promise();
			}

			$.when.apply($, ret).done(
				function() {
					for (i = 0; i < scriptContent.length; i++)
						try {
							eval(WinletJSEngine.procWinFunc(
								scriptContent[i], $container));
						} catch (e) {
							alert(e.message);
							alert(scriptContent[i]);
						}
				});
		},

		invokeAfterLoad: function($container) {
			if (WinletJSEngine.afterLoad) {
				try {
					WinletJSEngine.afterLoad($container);
				} catch (e) {}
			}
		},

		enableForm: function($container) {
			// !!!!! 修改以下逻辑时请注意与winlet_bootstrap中openDialog中的对应逻辑保持一致 !!!!!
			$container.find("form").filter(function() {
				var attrs = this.attributes;
				for (var i = 0; i < attrs.length; i++) {
					if (attrs[i].name.indexOf("data-winlet-") == 0)
						return true;
				}
				return false;
			}).each(function() {
				var form = $(this);
				var $containing = WinletJSEngine.getContainer(form);

				// form使用settings里的container来找到所属的container，而不是直接在DOM中寻找，因为在对话框中的form通过DOM不一定能找到所属的container
				var settings = {
					winFocus: true, // 提交完毕是否滚动所属窗口
					focus: form.attr("data-winlet-focus"),
					update: form.attr("data-winlet-update"),
					validate: form.attr("data-winlet-validate"),
					hideloading: form.attr("data-winlet-hideloading"),
					container: $containing == null ? $container : $containing
				};

				if ("true" == form.attr("data-winlet-win-nofocus"))
					settings.winFocus = false;
				if (settings.validate == null || settings.validate == "")
					settings.validate = "form";

				form.winform(settings);
			});
		},

		updateHref: function($container) {
			$container.find("a[data-winlet-href]").each(function() {
				var $this = $(this);
				var href = $this.data("winlet-href");

				if (WinletJSEngine.startsWith(href, "javascript:"))
					$this.attr("href", href);
				else {
					try {
						$this.attr("href", eval(href));
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
			headers.title = WinletJSEngine._utf8_decode(jqXHR
				.getResponseHeader('X-Winlet-Title'));

			if (WinletJSEngine.winletDomain && data) {
				// { 跨域请求无法通过Header来传值，切换为使用<div id="winlet_header"></div>来传递
				var settings = WinletJSEngine.reWinletHeader.exec(data);
				if (settings) {
					data = data.replace(WinletJSEngine.reWinletHeader, '');
					settings = JSON.parse(settings[1]);
					if (settings["X-Winlet-Redirect"])
						headers.redirect = settings["X-Winlet-Redirect"];
					if (settings["X-Winlet-Update"])
						headers.update = settings["X-Winlet-Update"];
					if (settings["X-Winlet-Dialog"])
						headers.dialog = settings["X-Winlet-Dialog"];
					if (settings["X-Winlet-Cache"])
						headers.cache = settings["X-Winlet-Cache"];
					if (settings["X-Winlet-Title"])
						headers.title = settings["X-Winlet-Title"];

					if (settings["X-Winlet-Session-ID"])
						WinletJSEngine
						.setSessionId(settings["X-Winlet-Session-ID"]);
				}
				// }
			}

			return headers;
		},

		/**
		 * Window方法执行返回结果的处理
		 * 
		 * @param $container
		 * @param focus
		 * @returns {Function}
		 */
		getWindowResponseHandler: function($container, focus) {
			var $winlet = WinletJSEngine.traceToWinlet($container);

			return function(data, textStatus, jqXHR) {
				var headers = WinletJSEngine.getWinletResponseHeaders(data,
					jqXHR);
				if (data) {
					data = data.replace(WinletJSEngine.reWinletHeader, '');

					// { 处理返回页面中包含的<meta>
					var mtitle = data.match(WinletJSEngine.reMetaTitle);
					if (mtitle)
						document.title = mtitle[1];

					data = data.replace(WinletJSEngine.reMeta, '');
					// }
				}

				if ($container.length == 0)
					return;

				if (headers.redirect != null && headers.redirect != "") {
					location.href = headers.redirect;
					return;
				}

				var dialog = false;
				if (WinletJSEngine.isRootWinlet($container) && WinletJSEngine.getWinSettings($container).dialog == "yes") {
					dialog = true;

					WinletJSEngine.openDialog($container, data, headers.title);
				} else {
					$container.html(WinletJSEngine.procStyle(WinletJSEngine
						.procWinFunc(data.replace(
								WinletJSEngine.reScriptAll, ''),
							$container, null)));
					$(function() {
						WinletJSEngine.enableForm($container);
						WinletJSEngine.updateHref($container);
					});

					WinletJSEngine.procScript(data, $container, null);
				}

				WinletJSEngine.invokeAfterLoad($container);
				WinletJSEngine.clearLoading($container);
				if ($winlet)
					$winlet.trigger("WinletWindowLoaded", $winlet);

				if (!dialog && focus)
					WinletJSEngine.ensureVisible($container);
			};
		},

		loadContent: function($container, focus, pageRefresh,
			loadWhenHashChanged, isInclude) {
			var dfd = $.Deferred();

			var $winlet = WinletJSEngine.traceToWinlet($container);
			if ($winlet == null)
				return dfd.reject().promise();

			var hashParams = WinletJSEngine.getHash($winlet);
			if (!pageRefresh && loadWhenHashChanged) { // 只有hash参数发生变化时才重新加载
				var savedParams = $winlet[0].hashParams;

				if (hashParams == null && savedParams == null)
					return dfd.resolve().promise();

				if (hashParams != null && savedParams != null && Object.keys(hashParams).length == Object
					.keys(savedParams).length) {
					var same = true;

					for (var key in hashParams) {
						if (Object.prototype.toString.call(hashParams[key]) === '[object Array]') {
							if (!Object.prototype.toString
								.call(savedParams[key]) === '[object Array]')
								same = false;
							else if ($(hashParams[key]).not(savedParams[key]).length != 0 || $(savedParams[key]).not(hashParams[key]).length != 0)
								same = false;
						} else if (hashParams[key] != savedParams[key]) {
							same = false;
							break;
						}
					}

					if (same)
						return dfd.resolve().promise();
				}
			}
			$winlet[0].hashParams = hashParams;

			WinletJSEngine.showLoading($winlet);
			var fullUrl = WinletJSEngine.getFullUrl(WinletJSEngine
				.getWinletUrl($winlet));
			$.ajax({
				type: 'POST',
				url: fullUrl,
				data: WinletJSEngine.mergeParam($winlet, {
					_x: 'y',
					_pg: window.location.pathname,
					_purl: window.location.href,
					_pr: pageRefresh ? "yes" : "no",
					_fi: isInclude ? "yes" : "no",
					_dn: WinletJSEngine.winletDomain
				}),
				success: function(data, textStatus, jqXHR) {
					WinletJSEngine.getWindowResponseHandler($winlet, focus)(
						data, textStatus, jqXHR);
					dfd.resolve();
				},
				error: function(req, textStatus, errorThrown) {
					WinletJSEngine.getErrorHandler($winlet)(req, textStatus,
						errorThrown);
					dfd.reject();
				},
				dataType: "html"
			});
			WinletJSEngine.analyticWindow(fullUrl);

			return dfd.promise();
		},

		updateWindows: function($container, wins, nofocus) {
			if (wins == null || wins == '')
				return $.Deferred().resolve().promise();

			var $winlet = WinletJSEngine.traceToWinlet($container);

			var update = wins.split(',');
			var i;
			var unknown = null;
			var dfds = [];

			for (i = 0; i < update.length; i++) {
				try {
					var ud = update[i].trim();

					if (ud == "winlet" || ud == "window") {
						dfds.push(WinletJSEngine.loadContent($winlet));
						continue;
					}

					if (ud == "parent") {
						var $parent = WinletJSEngine
							.getWinlet($winlet.parent());
						if ($parent != null)
							dfds.push(WinletJSEngine.loadContent($parent));
						continue;
					}

					if (ud == "root") {
						var $root = WinletJSEngine
							.getRootWinlet($winlet);
						if ($root != null)
							dfds.push(WinletJSEngine.loadContent($root));
						continue;
					}

					var focus = false;
					if (ud.indexOf("!") == 0) {
						focus = true;
						ud = ud.substring(1);
					}

					if (ud.indexOf("/") == 0)
						ud = ud.substring(1);

					// winlet URL需要从source winlet来获取
					if (ud.indexOf("/") >= 0)
						ud = WinletJSEngine.getContextRoot($winlet) + ud;
					else
						ud = WinletJSEngine.getWinletRoot($winlet) + ud;

					// 注意：以ud开始的所有窗口都会被刷新。例如指定update为brief，名为briefWin的窗口也会被更新
					$('div[data-winlet-url^="' + ud + '"]').each(
						function() {
							dfds.push(WinletJSEngine.loadContent($(this),
								focus && !nofocus));
						});
				} catch (e) {}
			}

			return $.when.apply($, dfds);
		},

		/**
		 * Action方法执行返回结果的处理
		 * 
		 * @param $container
		 * @returns {Function}
		 */
		getActionResponseHandler: function($container, focus) {
			var form = null;
			var funcs = null;

			for (var i = 2; i < arguments.length; i++) {
				if (arguments[i] == null)
					continue;

				// 参数如果是对象数组，则视为是回调函数数组
				if (Object.prototype.toString.call(arguments[i]) == '[object Array]')
					funcs = arguments[i];
				else
				// 如果不是对象数组，则视为被提交的表单对象
					form = arguments[i];
			}

			return function(data, textStatus, jqXHR) {
				var dfd = $.Deferred();

				var headers = WinletJSEngine.getWinletResponseHeaders(data,
					jqXHR);
				if (data) {
					data = data.replace(WinletJSEngine.reWinletHeader, '');

					// { 处理返回页面中包含的<meta>
					var mtitle = data.match(WinletJSEngine.reMetaTitle);
					if (mtitle)
						document.title = mtitle[1];

					data = data.replace(WinletJSEngine.reMeta, '');
					// }
				}

				if (headers.redirect != null && headers.redirect != "") {
					location.href = headers.redirect;
					return dfd.resolve().promise();
				}

				if (headers.update == "page") {
					location.reload();
					return dfd.resolve().promise();
				}

				WinletJSEngine.clearLoading($container);

				// 只有处理表单提交响应时form参数才不为null。如果时直接调用action或者翻译窗口url，form参数都为空
				if (form != null && headers.dialog != "yes" && data.indexOf("WINLET_FORM_RESP:") == 0) {
					// 提交表单并且表单校验出错
					WinletJSEngine.form.validateClearAll(form);
					WinletJSEngine.form.applyChanges(data.substr(17), form);

					if (form.onerror != undefined) {
						try {
							form.onerror(null);
						} catch (e) {}
					}
					return dfd.resolve().promise();
				}

				var d;
				if (headers.dialog != "yes")
					d = WinletJSEngine.closeDialog($container);
				else {
					d = $.Deferred();
					d.resolve();
				}

				d.done(function() {
					var dataProcessed = false;
					if (funcs != null) {
						for (var i = 0; i < funcs.length; i++) {
							try {
								var ret = funcs[i](data, textStatus, jqXHR,
									$container);

								// 函数返回false则表示返回的数据已经处理完毕
								if (ret != undefined && ret != null && !ret) {
									dataProcessed = true;
									break;
								}
							} catch (e) {
								alert(e);
							}
						}
					}

					if (headers.dialog == "yes") {
						if (!dataProcessed)
							WinletJSEngine.openDialog($container, data,
								headers.title);
					} else {
						if (!dataProcessed && !(headers.cache == "yes")) {
							if (headers.target == 'window' || headers.target == 'winlet')
								$container = WinletJSEngine.traceToWinlet($container);

							WinletJSEngine.getWindowResponseHandler($container,
								focus && (headers.update == null || headers.update.indexOf('!') == -1))(data, textStatus, jqXHR);
						}
					}

					WinletJSEngine.updateWindows($container, headers.update)
						.done(function() {
							dfd.resolve();
						}).fail(function() {
							dfd.reject();
						});
				});

				return dfd.promise();
			};
		},

		// 简单的错误处理 － 刷新当前页面
		getErrorHandler: function($container) {
			return function(req, textStatus, errorThrown) {};
		},

		isInt: function(n) {
			return n != undefined && n != null && Number(n) === n && n % 1 === 0;
		},

		// 如果名称匹配namePattern的JS文件的来源域名与当前页面的域名不一样，返回JS文件的来源域名。返回值可以作为Winlet
		// setting的WinletDomain值使用
		getWinletDomainByScript: function(namePattern) {
			var lm = location.href.match(/(http(s)?:\/\/[^\/]+)\//i);

			// 页面在本地打开会匹配不成功
			var pageDomain = lm ? lm[1] : null;
			var scriptDomain = null;

			var pattern = new RegExp('^(http(s)?://[^/]+)/.*' + namePattern,
				'i');
			$('script').each(function() {
				if (scriptDomain != null)
					return;

				var match = this.src.match(pattern);
				if (match && match[1] != pageDomain)
					scriptDomain = match[1];
			});

			return scriptDomain;
		},

		/***********************************************************************
		 * 
		 * 扫描<div data-winlet="">标签，在其中生成<div
		 * id="ap_win_">标签，并为生成的标签设置settings属性对象。 settings中可以包含以下属性： hashgroup
		 * 该window所属的参数组。相同组的window共享hash参数 dialog 如果值为yes表示用弹出对话框显示窗口 close
		 * 对于弹出对话框显示的窗口，关闭窗口时调用的Winlet的方法 url Winlet的窗口的URL
		 * 
		 * 根窗口才有settings和hashgroup，子窗口共享根窗口的settings和hashgroup
		 * 
		 **********************************************************************/
		analyticHashChanged: function() {},
		analyticWindow: function() {},
		analyticAction: function() {},
		analyticValidate: function() {},

		setup: function(settings) {
			if (settings) {
				if (settings.analytic && settings.analytic.hashChanged)
					WinletJSEngine.analyticHashChanged =
					function() {
						settings.analytic.hashChanged();
					};
				if (settings.analytic && settings.analytic.window)
					WinletJSEngine.analyticWindow =
					function(url) {
						settings.analytic.window(url);
					};
				if (settings.analytic && settings.analytic.action)
					WinletJSEngine.analyticAction =
					function(url) {
						settings.analytic.action(url);
					};
				if (settings.analytic && settings.analytic.validate)
					WinletJSEngine.analyticValidate =
					function(url) {
						settings.analytic.validate(url);
					};

				if (WinletJSEngine.isInt(settings.left))
					WinletJSEngine.leftSpace = settings.left;
				if (WinletJSEngine.isInt(settings.right))
					WinletJSEngine.rightSpace = settings.right;
				if (WinletJSEngine.isInt(settings.top))
					WinletJSEngine.topSpace = settings.top;
				if (WinletJSEngine.isInt(settings.bottom))
					WinletJSEngine.bottomSpace = settings.bottom;
				if (settings.winletDomain)
					WinletJSEngine.winletDomain = settings.winletDomain;
				if (settings.contextRoot)
					WinletJSEngine.contextRoot = settings.contextRoot;
				if (settings.hashchange && typeof settings.hashchange === 'function')
					WinletJSEngine.hashchange = settings.hashchange;
				if (settings.afterload && typeof settings.afterload === 'function')
					WinletJSEngine.afterLoad = settings.afterload;
			}
		},

		winletId: 1,

		init: function(settings) {
			var dfd = $.Deferred();

			var proc = function() {
				var loads = [];

				if (settings == null)
					settings = {};
				WinletJSEngine.setup(settings);

				// 初次初始化
				WinletJSEngine.isStatic = true;

				WinletJSEngine.updateHref($("body"));

				// 借助样式获取图片文件URL
				$("body")
					.append(
						"<div id='winlet_style_temp' style='display:none'><div class='winlet_background'>1</div><div class='winlet_loading'>2</div><div class='winlet_validating'>3</div></div>");
				$(function() {
					WinletJSEngine.ImgBg.src = $(
						"#winlet_style_temp .winlet_background").css(
						'background-image').replace(/^url|[\(\)"]/g, '');
					WinletJSEngine.ImgLoading.src = $(
						"#winlet_style_temp .winlet_loading").css(
						'background-image').replace(/^url|[\(\)"]/g, '');
					WinletJSEngine.ImgValidating.src = $(
						"#winlet_style_temp .winlet_validating").css(
						'background-image').replace(/^url|[\(\)"]/g, '');
					$("#winlet_style_temp").remove();

					// 获得图片文件URL后再开始加载窗口

					$('div[data-winlet-url]').each(function() { // 初始化预加载的窗口中的表单
						WinletJSEngine.enableForm($(this));
						WinletJSEngine.updateHref($(this));
					});

					var hasHash = window.location.toString().indexOf("#") > 0;

					$('div[data-winlet]')
						.each(
							function() { // 强制预加载窗口和include子窗口没有data-winlet属性，不会被处理
								var preloaded = $(this).attr(
									"data-winlet-url") != null;

								var attr = $(this).data("winlet");
								if (!attr.indexOf("/") == 0)
									attr = "/" + attr;
								var match = attr
									.match(WinletJSEngine.reWinlet);

								var url = match[1];
								if (!url.indexOf("/") == 0)
									url = "/" + url;
								$(this).attr("data-winlet-url", url);

								// 提取data-winlet中的参数
								if (match.length > 5 && match[5] != null && match[5] != null)
									$(this)
									.attr(
										"data-winlet-params",
										JSON
										.stringify($
											.deparam(match[5])));

								// 提取data-winlet中的设置
								if (match.length > 7 && match[7] != null && match[7] != '') {
									var settings = {};

									var params = match[7].split(',');
									var i;

									for (i = 0; i < params.length; i++) {
										var pmatch = params[i]
											.match(WinletJSEngine.reWinletParam);
										settings[pmatch[1]] = pmatch[2];
									}

									$(this).attr(
										"data-winlet-settings",
										JSON.stringify(settings));
								}

								if (preloaded) { // winlet已经在服务器端预加载
									if (hasHash) // 客户端已经有状态数据，需要重新加载。winlet可以通过pageUrl访问所有hash数据，不一定只使用其hashgroup中的数据
										loads.push(WinletJSEngine.loadContent($(this), false, true));
								} else { // winlet未在服务器端预加载，分配id，加载内容
									// ID不会被传送给服务器端。分配ID的目的是为了让javascript脚本
									// 能够找到所属的winlet
									$(this).attr("data-winlet-id", ++WinletJSEngine.winletId);
									loads.push(WinletJSEngine.loadContent($(this), false, true));
								}
							});
					
					if (loads.length == 0)
						dfd.resolve();
					else
						$.when.apply($, loads).done(function() {
							dfd.resolve();
						});
				});
			};

			if (settings && settings.delay === false)
				proc();
			else
				$(function() {
					proc();
				});

			return dfd.promise();
		}
	};

	$.fn.winform = function() {
		var settings = $.extend({}, arguments[0]);

		return this
			.each(function() {
				if (this.winsubmit)
					return;

				this.getSettings = function() {
					return settings;
				};

				var form = this;
				var $form = $(this);

				try {
					if (!$form.attr("action").match(WinletJSEngine.reAction)) { // 服务器端没有用<win:form>,
						// 未生成完整的Winlt
						// Action
						// URL，在客户端补齐
						this.winletAction = WinletJSEngine
							.getWinletUrl(settings.container) + "?_a=" + $form.attr("action");
					} else { // 服务器端使用<win:form>已经生成了完整的Winlet Action URL
						this.winletAction = $form.attr("action");
					}
				} catch (e) { // 如果method为get则没有action
				}

				// 给表单加上提交处理方法
				// 作为表单提交事件的处理函数，winsubmit函数的返回值是true或false，表示是否要继续缺省的表单提交动作。
				// 要获知提交处理完成的通知，可以调用win$.submit()，win$.submit()会返回promise对象。
				this.winsubmit = function(state) {
					// 需要获知submit情况的调用者可以在触发winsubmit之前把form的windeferred属性设置为Deferred对象
					// 因为直接调用form.submit()时无法把参数直接传递给winsubmit，所以用这个间接的方法
					var dfd = form.windeferred;
					form.windeferred = null;
					if (dfd == null)
						dfd = $.Deferred();

					if (form.onsubmit != null)
						try {
							if (!form.onsubmit()) {
								dfd.reject();
								return false;
							}
						} catch (e) {
							dfd.reject();
							return false;
						}

					// form使用settings里的container来找到所属的container，而不是直接在DOM中寻找，因为在对话框中的form通过DOM不一定能找到所属的container
					var $container = settings.container;
					if ($container == null || $container.length == 0) {
						dfd.reject();
						return false;
					}

					var $target = settings.target ? settings.target : $container;

					if ($form.attr("enctype") == "multipart/form-data") {
						form.action = form.winletAction + "&" + WinletJSEngine.mergeParam($container, {
							_pg: window.location.pathname,
							_purl: window.location.href,
							_dn: WinletJSEngine.winletDomain
						});
						dfd.resolve();
						return true;
					}

					if ($form.attr('method').toUpperCase() != 'POST') {
						// GET的处理。方式无需调用action，直接刷新window
						var params = $.deparam($form.serialize());
						$form.find(":checkbox").each(function() {
							if (params[this.name] == undefined)
								params[this.name] = "";
						});
						WinletJSEngine.setHash($container, params);

						if (settings.update == "parent") {
							var $parent = WinletJSEngine
								.getWinlet(WinletJSEngine
									.traceToWinlet($container)
									.parent());
							if ($parent != null) {
								WinletJSEngine.loadContent($parent).done(
									function() {
										dfd.resolve();
									}).fail(function() {
									dfd.reject();
								});
								return false;
							}
							dfd.reject();
							return false;
						}

						$.when(
								WinletJSEngine.loadContent($container),
								WinletJSEngine.updateWindows($container,
									settings.update, form.nofocus || !settings.winFocus))
							.done(function() {
								dfd.resolve();
							}).fail(function() {
								dfd.reject();
							});
						return false;
					}

					// POST的处理
					try {
						if (settings.hideloading != 'yes') {
							WinletJSEngine.showLoading($target,
								settings.dialog);
						}
					} catch (e) {}

					var disabled = new Array();
					var inputs = $form.find(":input:disabled");
					for (var i = 0; i < inputs.length; i++)
						if (inputs[i].name != '')
							disabled[disabled.length] = inputs[i].name;

					var fields = new Array();
					inputs = $form.find(":input");
					for (var i = 0; i < inputs.length; i++)
						if (inputs[i].name != '')
							fields[fields.length] = inputs[i].name;

					var fullUrl = WinletJSEngine
						.getFullUrl(form.winletAction);
					$
						.ajax({
							type: 'POST',
							url: fullUrl,
							data: WinletJSEngine
								.mergeParam(
									$container,
									$
									.deparam($form
										.serialize()), {
										_x: 'y',
										_v: settings.validate,
										_ff: fields,
										_fd: disabled,
										_pg: window.location.pathname,
										_purl: window.location.href,
										_c: ($target
											.attr("data-winlet-url") == null ? 'y' : 'n'),
										_dn: WinletJSEngine.winletDomain
									}),
							success: function(data, textStatus, jqXHR) {
								WinletJSEngine
									.getActionResponseHandler(
										$target, settings.winFocus, form,
										form.aftersubmit)(data,
										textStatus, jqXHR)
									.done(function() {
										dfd.resolve();
									}).fail(function() {
										dfd.reject();
									});
							},
							error: function(req, textStatus,
								errorThrown) {
								WinletJSEngine.getErrorHandler($target)
									(req, textStatus, errorThrown);
								dfd.reject();
							},
							dataType: "text"
						});
					WinletJSEngine.analyticAction(fullUrl);

					return false;
				};

				this.ajaxValidate = function(input, name, value) {
					if (name == undefined)
						name = input.name;

					// form使用settings里的container来找到所属的container，而不是直接在DOM中寻找，因为在对话框中的form通过DOM不一定能找到所属的container
					var $container = settings.container;
					if ($container == null || $container.length == 0)
						return false;

					WinletJSEngine.form.validating(input);

					var val = value;

					if (input.type == 'checkbox') {
						if (input.checked)
							val = input.value;
					} else
						val = input.value;

					var param = {
						_vf: name,
						_vv: val,
						_vid: input.id
					};
					$.extend(param, $.deparam($(input).serialize()));

					$form.find(":hidden").each(function() {
						$.extend(param, $.deparam($form.serialize()));
					});

					var fullUrl = WinletJSEngine.getFullUrl(form.winletAction);
					$.ajax({
						type: 'POST',
						url: fullUrl,
						data: WinletJSEngine.mergeParam($container, param, {
							_x: 'y',
							_pg: window.location.pathname,
							_purl: window.location.href,
							_dn: WinletJSEngine.winletDomain
						}),
						success: WinletJSEngine.form
							.getValidateResponseHandler(input.form,
								name, input),
						dataType: "json"
					});
					WinletJSEngine.analyticValidate(fullUrl);
				};

				$form.submit(form.winsubmit);

				if (settings.focus) {
					var inp = $form.find(':input[name="' + settings.focus + '"], textarea[name="' + settings.focus + '"]');
					inp.select();
					inp.focus();
				}

				this.setAction = function(action) {
					if (action == null || action == '')
						return;

					if (!$form.attr('action')
						.match(WinletJSEngine.reAction)) { // 服务器端未生成完整的Winlt
						// Action
						// URL
						$form.attr('action', action);
						form.winletAction = WinletJSEngine
							.getWinletUrl(settings.container) + "?_a=" + action;
					} else { // 服务器端已经生成了完整的Winlet Action URL
						action = $form.attr('action').replace(
							WinletJSEngine.reAction, "$1?_a=" + action);
						$form.attr('action', action);
						form.winletAction = action;
					}
				}

				// 如果表单内动态增减了输入字段，需要调用这个方法来更新ajax数据校验机制
				this.updateValidate = function() {
					if (settings.validate == 'yes') {
						var form = this;
						var $form = $(form);

						$form
							.find(":input")
							.each(
								function() {
									if (this.name == null || this.name == '')
										return;

									var $this = $(this);
									if ($this
										.closest("[data-validate='no']").length > 0)
										return;

									if ($this.prop('tagName') == 'INPUT') {
										var type = $(this).prop(
											"type");
										if (!(type == "text" || type == "email" || type == "checkbox" || type == "radio" || type == "password")) {
											return;
										}
									}

									if ($this.attr("tips") != undefined) {
										$this
											.off("blur")
											.off("fucos")
											.focus(
												function() {
													WinletJSEngine.form
														.showTip(this);
												})
											.blur(
												function() {
													WinletJSEngine.form
														.hideTip(this);
												});
									}

									// 避免把其他代码的change处理覆盖
									if (this.winletAjaxValidate == null) {
										this.winletAjaxValidate = true;
										$this
											.off('change')
											.change(
												function() {
													this.form
														.ajaxValidate(this);
												});
									}
								});
					}
				};

				this.updateValidate();
			});
	};

	var backToPrevPage = false;
	$(window).hashchange(function() {
		if (backToPrevPage) {
			history.go(-1);
			return;
		}

		WinletJSEngine.analyticHashChanged();

		if (WinletJSEngine.detectHashChange) {
			$('div[data-winlet]').each(function() { // 强制预加载窗口和include子窗口没有data-winlet属性，不会被处理
				WinletJSEngine.loadContent($(this), false, false, true);
			});
		} else
			WinletJSEngine.detectHashChange = true;

		if (WinletJSEngine.hashchange)
			WinletJSEngine.hashchange();
	});

	return {
		jQuery: $,
		$: $,

		engine: WinletJSEngine,

		init: WinletJSEngine.init,
		setup: WinletJSEngine.setup,
		ensureVisible: WinletJSEngine.ensureVisible,
		form: WinletJSEngine.form,
		showLoading: WinletJSEngine.showLoading,
		getPositionInViewport: WinletJSEngine.getPositionInViewport,
		parseJson: WinletJSEngine.parseJson,

		/**
		 * 将参数转成JSON格式。
		 * 
		 * @param params
		 *            要转换的对象，可以为表单名称，表单对象，JSON数据或URL param格式的字符串
		 * @returns
		 */
		getParams: function(params, $container) {
			try {
				if (typeof params == "string") { // 类型为字符串
					if (params.indexOf("{") == 0) { // json字符串
						return $.parseJSON(params);
					}
					if (params.indexOf("=") > 0) // URL param格式字符串
						return $.deparam(params);
					else
					// params为form name
						params = WinletJSEngine.getForm($container, params);
				}

				if (params != null && params.is('form'))
					return $.deparam(params.serialize());
			} catch (e) {}

			return params;
		},

		/**
		 * 回退到上一页（不是上一个hash状态）
		 */
		back: function() {
			backToPrevPage = true;
			history.go(-1);
		},

		_winlet: function(element) {
			return WinletJSEngine.getWinlet(element);
		},

		_container: function(element) {
			return WinletJSEngine.getContainer(element);
		},

		// 可以在Winlet外调用
		post: function(action) {
			return win$._post(null, null, action);
		},

		_post: function(element, container, action) {
			if (action == null)
				action = "";

			var dfd = $.Deferred();

			var $container = null;

			if (element != null) {
				$container = WinletJSEngine.getContainer(element);
				if ($container == null)
					return dfd.reject().promise();
			}

			var hash = null;
			var focus = false;

			if (typeof action == "object") {
				hash = action.hash;
				if (action.hasOwnProperty("focus"))
					focus = action.focus;
				action = action.action;
			}

			var idx = action.indexOf(":");
			if (idx > 0) { // 调用其他Winlet的Action
				var winlet = action.substr(0, idx);
				action = action.substr(idx + 1);

				$container = $('div[data-winlet-url^="' + WinletJSEngine.getWinletUrl($container, winlet) + '"]');
				if ($container.length == 0)
					return dfd.reject().promise();

				if ($container.length > 1)
					$container = $($container[0]);
			}

			if ($container == null)
				return dfd.reject().promise();

			var hasTarget = false;
			if (container != null) { // embed处理
				var $targetContainer = null;

				if (container instanceof $ || container instanceof jQuery)
					$targetContainer = container;
				else if (typeof container === "string") {
					if (container.indexOf("#") == 0) // 通过id指定嵌入的位置，在整个页面中查找
						$targetContainer = $(container);
					else if ($container.is(container))
						$targetContainer = $container;
					else
						$targetContainer = $container.find(container);
				}

				if ($targetContainer.length != 1) // 找不到指定的container，或不只1个匹配
					return dfd.reject().promise();

				if ($targetContainer.data("winlet-id") == null || $targetContainer.data("winlet-id") == '')
					$targetContainer.attr("data-winlet-id",
						++WinletJSEngine.winletId);
				$targetContainer.removeAttr("data-winlet-url");

				$targetContainer.attr("data-winlet-src-id", $container
					.data("winlet-id"));
				$container = $targetContainer;
				hasTarget = true;
			}

			var params = {};
			var funcs = [];

			if (hash != null)
				WinletJSEngine.setHash($container, hash);

			for (var i = 3; i < arguments.length; i++) {
				if (arguments[i] == null)
					continue;

				if (typeof arguments[i] === 'function')
					funcs[funcs.length] = arguments[i];
				else
					$.extend(params, win$.getParams(arguments[i], $container));
			}

			if (hasTarget && $container.attr("data-winlet-url") == null) // 指定了$container：把参数保存到$container中
				$container.attr("data-winlet-params", JSON.stringify(params));

			var fullUrl = WinletJSEngine.getFullUrl(WinletJSEngine
				.getWinletUrl($container));
			$.ajax({
				type: 'POST',
				url: fullUrl,
				data: WinletJSEngine.mergeParam($container, params, {
					_x: 'y',
					_a: action,
					_pg: window.location.pathname,
					_purl: window.location.href,
					_c: ($container.attr("data-winlet-url") == null ? 'y' : 'n'),
					_dn: WinletJSEngine.winletDomain
				}),
				success: function(data, textStatus, jqXHR) {
					WinletJSEngine.getActionResponseHandler($container, focus,
						funcs)(data, textStatus, jqXHR).done(function() {
						dfd.resolve();
					}).fail(function() {
						dfd.reject();
					});
				},
				error: function(req, textStatus, errorThrown) {
					WinletJSEngine.getErrorHandler($container)(req, textStatus,
						errorThrown);
					dfd.reject();
				},
				dataType: "html"
			});
			WinletJSEngine.analyticAction(fullUrl);

			return dfd.promise();
		},

		_include: function(element, container, url, focus) {
			if (!container)
				return $.Deferred().reject().promise();

			var $container = null;
			if (element != null)
				$container = WinletJSEngine.getContainer(element);

			// { include目标容器
			var $target = null;
			if (container instanceof $ || container instanceof jQuery)
				$target = container;
			else if (typeof container === "string") {
				if (container.indexOf("#") == 0) // 通过id指定嵌入的位置，在整个页面中查找
					$target = $(container);
				else if ($container != null)
					$target = $container.find(container);
			}

			if ($target == null || $target.length != 1) // 找不到指定的container，或不只1个匹配
				return $.Deferred().reject().promise();

			if ($target.data("winlet-id") == null || $target.data("winlet-id") == '')
				$target.attr("data-winlet-id", ++WinletJSEngine.winletId);
			// }

			if (element != null) { // 在winlet中执行inlcude，会把winlet参数带上。url不需要完整
				if ($container == null)
					return $.Deferred().reject().promise();

				var params = {};

				for (var i = 4; i < arguments.length; i++) {
					if (arguments[i] == null)
						continue;

					$.extend(params, win$.getParams(arguments[i], $container));
				}

				// 把参数保存到$target中
				$target.attr("data-winlet-params", JSON.stringify(params));
				$target.attr("data-winlet-url", WinletJSEngine.getWinletUrl(
					$container, url));
			} else { // 脱离winlet执行include, URL必须是完整的winlet url
				var params = {};

				for (var i = 3; i < arguments.length; i++) {
					if (arguments[i] == null)
						continue;

					$.extend(params, arguments[i]);
				}

				// 把参数保存到$target中
				$target.attr("data-winlet-params", JSON.stringify(params));
				$target.attr("data-winlet-url", url);
			}

			if ($container != null)
				$target.attr("data-winlet-src-id", $container.data("winlet-id"));

			return WinletJSEngine.loadContent($target, focus, null, null, true);
		},

		_ajax: function(element, paramFunc) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return null;

			$.ajax(paramFunc($container));

			return false;
		},

		_get: function(element, param) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return $.Deferred().reject().promise();

			var reload = true;
			var update = null;
			var focus = true;
			var replace = false;

			if (param != null)
				if (typeof param == "object") {
					for (var prop in param) {
						if ("reload" == prop)
							reload = param[prop];
						if ("update" == prop)
							update = param[prop];
						if ("focus" == prop)
							focus = param[prop];
						if ("replaceHash" == prop)
							replace = param[prop];
					}
				} else {
					update = param;
				}

			var params = {};

			for (var i = 2; i < arguments.length; i++)
				$.extend(params, win$.getParams(arguments[i], $container));

			var focusUpdate = false;
			if (update && update.indexOf("!") >= 0)
				focusUpdate = true;

			var arr = [];
			WinletJSEngine.setHash($container, params, false, replace);
			if (reload)
				arr.push(WinletJSEngine.loadContent($container, focus && !focusUpdate));
			if (update)
				arr.push(WinletJSEngine.updateWindows($container, update));

			if (arr.length > 0)
				return $.when.apply($, arr);

			return $.Deferred().resolve().promise();
		},

		_toggle: function(element, update) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return $.Deferred().reject().promise();

			var params = {};

			for (var i = 2; i < arguments.length; i++) {
				$.extend(params, win$.getParams(arguments[i], $container));
			}

			WinletJSEngine.setHash($container, params, true);

			return $.when(WinletJSEngine.loadContent($container),
				WinletJSEngine.updateWindows($container, update));
		},

		_url: function(element, action) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return false;

			var params = {};

			for (var i = 2; i < arguments.length; i++)
				$.extend(params, win$.getParams(arguments[i], $container));

			var url = WinletJSEngine.getFullUrl(WinletJSEngine.getWinletUrl($container));
			if (url.indexOf("?") > 0)
				url += "&";
			else
				url += "?";

			return url + WinletJSEngine.mergeParam($container, params, {
				_x: 'y',
				_a: action,
				_pg: window.location.pathname,
				_purl: window.location.href,
				_dn: WinletJSEngine.winletDomain
			});
		},

		_submit: function(element, form, action) {
			var dfd = $.Deferred();
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return dfd.reject().promise();

			var f = null;
			if (typeof form === 'string')
				f = WinletJSEngine.getForm($container, form);
			else {
				try {
					f = $(form).closest("form");
				} catch (e) {}
			}
			if (f == null || f.length != 1 || !f[0].setAction)
				return dfd.reject().promise();

			f[0].setAction(action);

			var nofocus = false;
			var params = {};
			for (var i = 3; i < arguments.length; i++) {
				if (arguments[i] == null)
					continue;

				if (i == 3 && typeof(arguments[i]) === "boolean") {
					nofocus = arguments[i];
					continue;
				}

				$.extend(params, win$.getParams(arguments[i], $container));
			}

			for (var key in params) {
				f.find("input[name=" + key + "]").attr("value", params[key]);
			}

			f[0].windeferred = dfd;
			f[0].nofocus = nofocus;
			f.submit();

			return dfd.promise();
		},

		_aftersubmit: function(element, form) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return false;

			var f = WinletJSEngine.getForm($container, form);
			if (f.length != 1)
				return false;

			var funcs = [];
			for (var i = 2; i < arguments.length; i++) {
				if (arguments[i] == null)
					continue;

				if (typeof arguments[i] === 'function')
					funcs[funcs.length] = arguments[i];
			}

			f[0].aftersubmit = funcs;

			return false;
		},

		_find: function(element, query) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return $();
			if (!query)
				return $container;

			var $found = $container.find(query);
			if ($found.length != 0)
				return $found;

			var $dialog = WinletJSEngine.getDialog(WinletJSEngine
				.traceToWinlet($container), false);
			if ($dialog == null)
				return $();
			return $dialog.find(query);
		},

		/**
		 * 返回一个promise，用于等待页面中出现selector对应的元素，等待时间不超过maxwait
		 */
		_wait: function(element, selector, maxwait) {
			var $container = WinletJSEngine.getContainer(element);
			if ($container == null)
				return false;

			var start = (new Date()).getTime();
			var dfd = $.Deferred();

			(function() {
				if ($container.find(selector) == undefined) {
					if (maxwait != null && (new Date()).getTime() - start > maxwait)
						dfd.reject();
					else
						window.setTimeout(arguments.callee, 300);
				} else {
					dfd.resolve();
				}
			})();

			return dfd.promise();
		}
	};
}(window.winletJQuery || jQuery);