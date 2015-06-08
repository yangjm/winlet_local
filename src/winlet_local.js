(function(jQuery, window, undefined) {
	"use strict";

	var matched, browser;

	jQuery.uaMatch = function(ua) {
		ua = ua.toLowerCase();

		var match = /(chrome)[ \/]([\w.]+)/.exec(ua)
				|| /(webkit)[ \/]([\w.]+)/.exec(ua)
				|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
				|| /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0
				&& /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

		var platform_match = /(ipad)/.exec(ua) || /(iphone)/.exec(ua)
				|| /(android)/.exec(ua) || [];

		return {
			browser : match[1] || "",
			version : match[2] || "0",
			platform : platform_match[0] || ""
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

})(jQuery, window);

/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman Dual licensed under the MIT and GPL
 * licenses. http://benalman.com/about/license/
 */
(function($, e, b) {
	var c = "hashchange", h = document, f, g = $.event.special, i = h.documentMode, d = "on"
			+ c in e
			&& (i === b || i > 7);
	function a(j) {
		j = j || location.href;
		return "#" + j.replace(/^[^#]*#?(.*)$/, "$1")
	}
	$.fn[c] = function(j) {
		return j ? this.bind(c, j) : this.trigger(c)
	};
	$.fn[c].delay = 50;
	g[c] = $.extend(g[c], {
		setup : function() {
			if (d) {
				return false
			}
			$(f.start)
		},
		teardown : function() {
			if (d) {
				return false
			}
			$(f.stop)
		}
	});
	f = (function() {
		var j = {}, p, m = a(), k = function(q) {
			return q
		}, l = k, o = k;
		j.start = function() {
			p || n()
		};
		j.stop = function() {
			p && clearTimeout(p);
			p = b
		};
		function n() {
			var r = a(), q = o(m);
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
		$.browser.msie
				&& !d
				&& (function() {
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
								} catch (s) {
								}
							}
						}
					};
					j.stop = k;
					o = function() {
						return a(q.location.href)
					};
					l = function(v, s) {
						var u = q.document, t = $.fn[c].domain;
						if (v !== s) {
							u.title = h.title;
							u.open();
							t
									&& u.write('<script>document.domain="' + t
											+ '"<\/script>');
							u.close();
							q.location.hash = v
						}
					}
				})();
		return j
	})()
})(jQuery, this);

/*
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman Dual licensed under the MIT and GPL
 * licenses. http://benalman.com/about/license/
 */

(function($, r) {
	var h, n = Array.prototype.slice, t = decodeURIComponent, a = $.param, j, c, m, y, b = $.bbq = $.bbq
			|| {}, s, x, k, e = $.event.special, d = "hashchange", B = "querystring", F = "fragment", z = "elemUrlAttr", l = "href", w = "src", p = /^.*\?|#.*$/g, u, H, g, i, C, E = {};
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
		var I = [], L = {};
		$.each(a(J, K).split("&"), function(P, M) {
			var O = M.replace(/(?:%5B|=).*$/, ""), N = L[O];
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
		var K = {}, J = {
			"true" : !0,
			"false" : !1,
			"null" : null
		};
		$.each(L.replace(/\+/g, " ").split("&"), function(O, T) {
			var N = T.split("="), S = t(N[0]), M, R = K, P = 0, U = S
					.split("]["), Q = U.length - 1;
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
					M = M && !isNaN(M) ? +M : M === "undefined" ? h
							: J[M] !== h ? J[M] : M
				}
				if (Q) {
					for (; P <= Q; P++) {
						S = U[P] === "" ? R.length : U[P];
						R = R[S] = P < Q ? R[S]
								|| (U[P + 1] && isNaN(U[P + 1]) ? {} : []) : M
					}
				} else {
					if ($.isArray(K[S])) {
						K[S].push(M)
					} else {
						if (K[S] !== h) {
							K[S] = [ K[S], M ]
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
		a : l,
		base : l,
		iframe : w,
		img : w,
		input : w,
		form : "action",
		link : l,
		script : w
	});
	k = $[z];
	function v(L, J, K, I) {
		if (!G(K) && typeof K !== "object") {
			I = K;
			K = J;
			J = h
		}
		return this.each(function() {
			var O = $(this), M = J || k()[(this.nodeName || "").toLowerCase()]
					|| "", N = M && O.attr(M) || "";
			O.attr(M, a[L](N, K, I))
		})
	}
	$.fn[B] = D(v, B);
	$.fn[F] = D(v, F);
	b.pushState = s = function(L, I) {
		if (G(L) && /^#/.test(L) && I === h) {
			I = 2
		}
		var K = L !== h, J = c(location.href, K ? L : {}, K ? I : 2);
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
		add : function(I) {
			var K;
			function J(M) {
				var L = M[F] = c();
				M.getState = function(N, O) {
					return N === h || typeof N === "boolean" ? m(L, N)
							: m(L, O)[N]
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
})(jQuery, this);

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
}

jQuery.fn.winform = function() {
	var settings = $.extend({}, arguments[0]);

	return this
			.each(function() {
				if (this.winsubmit)
					return;

				// 给表单加上提交处理方法
				this.winsubmit = function() {
					if (this.onsubmit != null)
						try {
							if (!this.onsubmit())
								return false;
						} catch (e) {
							alert(e);
							return false;
						}

					var $winlet = settings.winlet;
					if ($winlet == null || $winlet.length == 0)
						return false;
					var $container = settings.container;

					if ($(this).attr("enctype") == "multipart/form-data") {
						this.action = this.action + "&"
								+ WinletJSEngine.mergeParam($winlet, $container, {
									_pg : window.location.pathname,
									_purl : window.location.href
								});
						return true;
					}

					if ($(this).attr('method').toUpperCase() != 'POST') {
						// GET的处理。方式无需调用action，直接刷新window
						var params = $.deparam($(this).serialize());
						$(this).find(":checkbox").each(function() {
							if (params[this.name] == undefined)
								params[this.name] = "";
						});
						WinletJSEngine.setHash($winlet, params);
						WinletJSEngine.loadContent($winlet);
						WinletJSEngine.updateWindows($winlet, settings.update);

						return false;
					}

					// POST的处理
					try {
						if (settings.hideloading != 'yes') {
							WinletJSEngine
									.showLoading($container, settings.dialog);
						}
					} catch (e) {
					}

					var disabled = new Array();
					var inputs = $(this).find(":input").find(":disabled");
					for (var i = 0; i < inputs.length; i++)
						if (inputs[i].name != '')
							disabled[disabled.length] = inputs[i].name;

					var fields = new Array();
					inputs = $(this).find(":input");
					for (var i = 0; i < inputs.length; i++)
						if (inputs[i].name != '')
							fields[fields.length] = inputs[i].name;

					$.ajax({
						type : 'POST',
						url : this.action,
						data : WinletJSEngine.mergeParam($winlet, $container, $.deparam($(
								this).serialize()), {
							_x : 'y',
							_v : settings.validate,
							_ff : fields,
							_fd : disabled,
							_pg : window.location.pathname,
							_purl : window.location.href,
							_c: ($container[0] == $winlet[0] ? 'n' : 'y')
						}),
						success : WinletJSEngine.getActionResponseHandler(
								$winlet, $container, false, this, this.aftersubmit),
						error : WinletJSEngine.getErrorHandler($winlet),
						dataType : "text"
					});

					return false;
				};

				this.ajaxValidate = function(input, name, value) {
					if (name == undefined)
						name = input.name;

					var $winlet = settings.winlet;
					if ($winlet == null || $winlet.length == 0)
						return;
					var $container = settings.container;

					WinletJSEngine.form.validating(input);

					var val = value;

					if (input.type == 'checkbox') {
						if (input.checked)
							val = input.value;
					} else
						val = input.value;

					var param = {
						_vf : name,
						_vv : val,
						_vid : input.id
					};
					param[name] = val;

					$(this).find(":hidden").each(function() {
						param[this.name] = this.value;
					});

					$.ajax({
						type : 'POST',
						url : this.action,
						data : WinletJSEngine.mergeParam($winlet, $container, param, {
							_x : 'y',
							_pg : window.location.pathname,
							_purl : window.location.href
						}),
						success : WinletJSEngine.form
								.getValidateResponseHandler(input.form, name,
										input),
						dataType : "json"
					});
				};

				$(this).submit(this.winsubmit);

				if (settings.focus) {
					var inp = $(this).find(
							'input[name="' + settings.focus + '"]');
					inp.select();
					inp.focus();
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
											if (this.name == null
													|| this.name == '')
												return;

											var $this = $(this);
											if ($this.data("validate") == "no")
												return;

											if ($this.prop('tagName') == 'INPUT') {
												var type = $(this).prop("type");
												if (!(type == "text"
														|| type == "email"
														|| type == "checkbox"
														|| type == "radio" || type == "password")) {
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

											$this
													.off('change')
													.change(
															function() {
																this.form
																		.ajaxValidate(this);
															});
										});
					}
				};

				this.updateValidate();
			});
};

var WinletJSEngine = {
	ImgBg : new Image(1, 1),
	ImgLoading : new Image(1, 1),
	ImgValidating : new Image(1, 1),

	topSpace : 0,
	bottomSpace : 0,
	leftSpace : 0,
	rightSpace : 0,

	widCounter : 0,
	isStatic : false,
	isApme : false,
	detectHashChange : true,

	reEscape : /(:|\.|\[|\])/g,
	reScriptAll : new RegExp('<script.*?>(?:\n|\r|.)*?<\/script>', 'img'),
	reScriptOne : new RegExp('<script(.*?)>((?:\n|\r|.)*?)<\/script>', 'im'),
	reScriptLanguage : new RegExp('.*?language.*?=.*?"(.*?)"', 'im'),
	reScriptSrc : new RegExp('.*?src.*?=.*?"(.*?)"', 'im'),
	reScriptType : new RegExp('.*?type.*?=.*?"(.*?)"', 'im'),
	reScriptCharset : new RegExp('.*?charset.*?=.*?"(.*?)"', 'im'),
	reCSSAll : new RegExp('<link.*?type="text/css".*?>', 'img'),
	reCSSHref : new RegExp('.*?href="(.*?)"', 'im'),
	reWinWinlet : new RegExp('win\\$\\.winlet\\s*\\(', 'img'),
	reWinPost : new RegExp('win\\$\\.post\\s*\\(', 'img'),
	reWinEmbed : new RegExp('win\\$\\.embed\\s*\\(', 'img'),
	reWinAjax : new RegExp('win\\$\\.ajax\\s*\\(', 'img'),
	reWinGet : new RegExp('win\\$\\.get\\s*\\(', 'img'),
	reWinToggle : new RegExp('win\\$\\.toggle\\s*\\(', 'img'),
	reWinUrl : new RegExp('win\\$\\.url\\s*\\(', 'img'),
	reWinSubmit : new RegExp('win\\$\\.submit\\s*\\(', 'img'),
	reWinFind : new RegExp('win\\$\\.find\\s*\\(', 'img'),
	reWinWait : new RegExp('win\\$\\.wait\\s*\\(', 'img'),
	reWinAfterSubmit : new RegExp('win\\$\\.aftersubmit\\s*\\(', 'img'),
	reWinlet : new RegExp(
			'^\\s*(((/?\\w+/).+/)\\w+)(\\?([^\\s]+))?(\\s+(.*?))?$'),
	reWinletParam : new RegExp('(\\w+)\\:(\\w+)'),
	reDialogSetting : new RegExp('<div id="ap_dialog">(.*?)<\/div>', 'img'),

	form : {
		createResultHolder : function(input) {
			if (input.m_result != null)
				return input.m_result;
			input.m_result = $(input.form).find(
					"span.validate_result[data-input='"
							+ input.name.replace("[", "\\[")
									.replace("]", "\\]").replace(".", "\\.")
							+ "']");
			if (input.m_result.length == 0) {
				input.m_result = $('<span class="validate_result"></span>');
				$(input).after(input.m_result);
			}
		},

		/**
		 * 返回的是jQuery对象 用WinletJSEngine.form不用this是为了重载
		 * 
		 * input: input元素对象
		 */
		getInputResult : function(input) {
			if (input.m_result == null)
				WinletJSEngine.form.createResultHolder(input);

			return input.m_result;
		},

		validateClearAll : function(form) {
			$(form).find("span.validate_result").each(function() {
				$(this).html('');
			});
		},

		validateClear : function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null)
				result.html('');
		},

		validating : function(input) {
		},

		validateSuccess : function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null)
				result.html('<span class="win_valpassed">&nbsp;</span>');
		},

		validateError : function(input, msg) {
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

		applyChanges : function(json, form, input) {
			var changes = null;
			try {
				changes = eval(json);
			} catch (e) {
			}

			if (changes != null) {
				for (var i = 0; i < changes.length; i++) {
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
							} else {
								// 校验结果只要有容器存在就可以设置，不一定要有对应的input
								var result = $(form).find(
										"span.validate_result[data-input='"
												+ changes[i].input + "']");
								if (result.length > 0) {
									inp = {
										m_result : result
									};

									WinletJSEngine.form.validateClear(inp);
									WinletJSEngine.form.validateError(inp,
											changes[i].message);
								}
							}
						}
					} else if (inp != null) {
						if (changes[i].type == 'u') { // 更新值
							if (inp.type == 'radio')
								$(form).children(
										":input[name='" + changes[i].input
												+ "'][value='"
												+ changes[i].value + "']")
										.attr('checked', 'checked');
							else if (inp.type == 'checkbox')
								inp.checked = changes[i].value;
							else {
								if (input == inp)
									WinletJSEngine.form.validateSuccess(input);
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
									$(inp).append(
											'<option value="'
													+ changes[i].list[j].id
													+ '">'
													+ changes[i].list[j].name
													+ '</option>');
							}
						}
					}
				}
			}
		},

		getValidateResponseHandler : function(form, name, input) {
			return function(json) {
				WinletJSEngine.form.validateClear(input);

				WinletJSEngine.form.applyChanges(json, form, input);

				if (form.onerror != undefined && input != undefined) {
					try {
						form.onerror(input);
					} catch (e) {
					}
				}
			};
		},

		showTip : function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null && result.html() == '')
				result.html('<div class="win_tips">' + $(this).attr('tips')
						+ '</div>');
		},

		hideTip : function(input) {
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null && result.find("div.win_tips").length > 0)
				result.html('');
		}
	},

	parseJson : function(str) {
		if (this.trim() == '')
			return {};

		if (JSON)
			return JSON.parse(str);
		return eval(str);
	},

	startsWith : function(str, w) {
		return str != null && typeof str == 'string' && w && str.slice(0, w.length) == w;
	},

	endsWith : function(str, w) {
		return str != null && typeof str == 'string' && w && str.slice(-w.length) == w;
	},

	_utf8_decode : function(utftext) {
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
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	},

	getForm: function($winlet, $container, name) {
		if ($container == null)
			$container = $winlet;

		if ($container != null) {
			var f = $container.find('form[name="' + name + '"]');
			if (f != null && f.length > 0)
				return f;
		}

		if ($winlet != null && $winlet[0].dlg != null)
			f = $winlet[0].dlg.find('form[name="' + name + '"]');
		return f;
	},

	getWinlet : function(element) {
		var $winlet = null;

		if (typeof element === "number")
			$winlet = $('div[data-winlet-id="' + element + '"]');
		else if (typeof element === "string" && element.match(/^\d+$/))
			$winlet = $('div[data-winlet-id="' + element + '"]');
		else if (element instanceof jQuery)
			$winlet = element.closest("div[data-winlet-url]");
		else
			$winlet = $(element).closest("div[data-winlet-url]");

		if ($winlet.length != 1)
			return null;

		if ($winlet.data("winlet-url") == null) // 如果给定的id不是winlet而是container, 找包含container的winlet
			return WinletJSEngine.getWinlet($winlet);

		return $winlet;
	},

	isRootWinlet : function($winlet) {
		return $winlet.data("winlet-url") != null && $winlet.parent().closest("div[data-winlet-url]").length == 0;
	},

	getContainer : function(element) {
		var $container = null;

		if (typeof element === "number")
			$container = $('div[data-winlet-id="' + element + '"]');
		else if (typeof element === "string" && element.match(/^\d+$/))
			$container = $('div[data-winlet-id="' + element + '"]');
		else if (element instanceof jQuery)
			$winlet = element.closest("div[data-winlet-id]");
		else
			$container = $(element).closest("div[data-winlet-id]");

		if ($container.length != 1)
			return null;

		// 返回的container可以是容器或者winlet
		return $container;
	},

	getWinletUrl : function($winlet) {
		return $winlet.data("winlet-url");
	},

	// winlet root - 对于winlet "/contextroot/winleturl/windowname"，winlet root是
	// "/contextroot/winleturl/"
	winletRootMap : {},
	getWinletRoot : function($winlet) {
		try {
			var url = WinletJSEngine.getWinletUrl($winlet);
			if (WinletJSEngine.winletRootMap[url] == null)
				WinletJSEngine.winletRootMap[url] = url
						.match(WinletJSEngine.reWinlet)[2];
			return WinletJSEngine.winletRootMap[url];
		} catch (e) {
			return null;
		}
	},

	// context root - 对于winlet "/contextroot/winleturl/windowname"，winlet root是
	// "/contextroot/"
	contextRootMap : {},
	getContextRoot : function($winlet) {
		try {
			var url = WinletJSEngine.getWinletUrl($winlet);
			if (WinletJSEngine.contextRootMap[url] == null)
				WinletJSEngine.contextRootMap[url] = url
						.match(WinletJSEngine.reWinlet)[3];
			return WinletJSEngine.contextRootMap[url];
		} catch (e) {
			return null;
		}
	},

	hashGroupMap : {},
	getHashGroup : function($winlet) {
		try {
			var url = WinletJSEngine.getWinletRoot($winlet);

			if (WinletJSEngine.hashGroupMap[url] == null) {
				var count = 0;
				for ( var k in WinletJSEngine.hashGroupMap) {
					if (WinletJSEngine.hashGroupMap.hasOwnProperty(k)) {
						++count;
					}
				}

				WinletJSEngine.hashGroupMap[url] = count + 1;
			}

			return WinletJSEngine.hashGroupMap[url];
		} catch (e) {
			return null;
		}
	},

	getWinSettings : function($winlet) {
		var settings = $winlet.data("winlet-settings");
		if (settings == null)
			return {};
		if (typeof settings == 'string' || settings instanceof String)
			return WinletJSEngine.parseJson(settings);
		return settings;
	},

	getHash : function($winlet) {
		var hashgroup = WinletJSEngine.getHashGroup($winlet);

		try {
			var params = $.deparam(window.location.toString().split('#')[1]);

			if ('root' == hashgroup) {
				var ret = {};
				for ( var p in params) {
					if (params.hasOwnProperty(p)
							&& !(typeof params.hasOwnProperty(p) === 'object'))
						ret[p] = params[p];
				}
				return ret;
			} else
				return params[hashgroup];
		} catch (e) {
		}

		return "";
	},

	setHash : function($winlet, hash, toggle) {
		var hashgroup = WinletJSEngine.getHashGroup($winlet);
		var params = null;

		try {
			params = $.deparam(window.location.toString().split('#')[1]);
		} catch (e) {
		}

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
		} else {
			$.extend(owner, hash);
		}

		for (property in owner) {
			if (owner[property] == '')
				delete owner[property];
		}

		WinletJSEngine.detectHashChange = false;
		var val = $.param(params);
		if (val == "")
			// hash set to empty string cause page scroll up to top, set it to _
			// to prevent this behavior
			window.location.hash = "_";
		else
			window.location.hash = val;

		if (WinletJSEngine.analytic)
			WinletJSEngine.analytic('setHash');
	},

	// 合并参数，优先级从高到低为：指定的参数，hash参数，get参数，当前container上声明的参数，父container上声明的参数
	mergeParam : function($winlet, $container) {
		var obj = {};

		if ($container == null)
			$container = $winlet;

		var parents = $container.parents("div[data-winlet-params]");
		for (var i = parents.length - 1; i >= 0; i--) {
			var params = $(parents[i]).data("winlet-params");
			if (params != null) {
				if (typeof params == "string")
					$.extend(obj, WinletJSEngine.parseJson(params));
				else
					$.extend(obj, params);
			}
		}

		var params = $container.data("winlet-params");
		if (params != null) {
			if (typeof params == "string")
				$.extend(obj, WinletJSEngine.parseJson(params));
			else
				$.extend(obj, params);
		}

		var idx = window.location.href.indexOf('?');
		if (idx > 0) {
			var queryStr = window.location.href.substr(idx + 1);
			idx = queryStr.indexOf("#");
			if (idx > 0)
				queryStr = queryStr.substr(0, idx);
			$.extend(obj, $.deparam(queryStr));
		}

		try {
			$.extend(obj, WinletJSEngine.getHash($winlet));
		} catch (e) {
		}

		for (var i = 2; i < arguments.length; i++) {
			if (arguments[i] != null)
				$.extend(obj, arguments[i]);
		}

		return $.param(obj, true);
	},

	ensureVisible : function($winlet) {
		try {
			var doc = document.documentElement;
			var left = (window.pageXOffset || doc.scrollLeft)
					- (doc.clientLeft || 0);
			var top = (window.pageYOffset || doc.scrollTop)
					- (doc.clientTop || 0);

			var rect = new ElmRect($winlet);
			rect.top -= WinletJSEngine.topSpace;
			rect.bottom += WinletJSEngine.bottomSpace;
			rect.left -= WinletJSEngine.leftSpace;
			rect.right += WinletJSEngine.rightSpace;

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
			if (scrollX != 0 || scrollY != 0)
				$('html,body').stop().animate({
					scrollLeft: '+=' + scrollX,
					scrollTop: '+=' + scrollY
					}, 500);
				// window.scrollBy(scrollX, scrollY);
		} catch (e) {
		}
	},

	clearLoading : function($container) {
		try {
			if ($container.loading) {
				$container.loading.remove();
				$container.loading = null;
			}
		} catch (e) {
		}
	},

	showLoading : function($container, dialog) {
		try {
			WinletJSEngine.clearLoading($container);

			var rect = new ElmRect($container);
			try {
				if (dialog != null)
					rect = new ElmRect(dialog);
			} catch (e) {
			}

			if (WinletJSEngine.ImgLoading.src != null
					&& WinletJSEngine.ImgLoading.src != ''
					&& WinletJSEngine.ImgBg.src != null
					&& WinletJSEngine.ImgBg.src != '') {
				// 如果图片不存在，img src=''会导致对页面的访问。因此图片不存在时不显示loading
				$container.loading = $("<div style='opacity:0;z-index:100000;position:absolute;background:url(" + WinletJSEngine.ImgBg.src
						+ ");left:" + rect.left + "px;top:" + rect.top + "px;width:" + rect.width + "px;height:" + rect.height
						+ "px'><table width='100%' height='100%' border='0'><tr height='100%'><td align='center' valign='middle'><img src='"
						+ WinletJSEngine.ImgLoading.src
						+ "'/></td></tr></table></div>");
				$container.loading.appendTo("body");
				
				// 如果请求能在1秒中内完成，就不要让用户看见loading
				setTimeout(function() {
					if ($container.loading)
						$container.loading.css("opacity", "1");
				}, 1000);
			}
		} catch (e) {
		}
	},

	procStyle : function(cont) {
		var css = cont.match(WinletJSEngine.reCSSAll) || [];
		var cssHref = $.map(css, function(tag) {
			return (tag.match(WinletJSEngine.reCSSHref) || [ '', '' ])[1];
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

	procWinFunc : function(cont, $container) {
		var containerId = $container.data("winlet-id");
		if (containerId == null)
			return null;

		return cont.replace(WinletJSEngine.reWinPost, 'win$._post(' + containerId + ', null, ')
				.replace(WinletJSEngine.reWinEmbed, 'win$._post(' + containerId + ', ')
				.replace(WinletJSEngine.reWinWinlet, 'win$._winlet(' + containerId)
				.replace(WinletJSEngine.reWinAjax, 'win$._ajax(' + containerId + ', ')
				.replace(WinletJSEngine.reWinGet, 'win$._get(' + containerId + ', ')
				.replace(WinletJSEngine.reWinToggle, 'win$._toggle(' + containerId + ', ')
				.replace(WinletJSEngine.reWinUrl, 'win$._url(' + containerId + ', ')
				.replace(WinletJSEngine.reWinSubmit, 'win$._submit(' + containerId + ', ')
				.replace(WinletJSEngine.reWinFind, 'win$._find(' + containerId + ', ')
				.replace(WinletJSEngine.reWinWait, 'win$._wait(' + containerId + ', ')
				.replace(WinletJSEngine.reWinAfterSubmit, 'win$._aftersubmit(' + containerId + ', ');
	},

	procScript : function(cont, $container) {
		var containerId = $container.data("winlet-id");
		if (containerId = null)
			return null;
		var scripts = cont.match(WinletJSEngine.reScriptAll) || [];
		var scriptContent = $.map(scripts,
				function(scriptTag) {
					return (scriptTag.match(WinletJSEngine.reScriptOne) || [
							'', '', '' ])[2];
				});
		var scriptDef = $.map(scripts,
				function(scriptTag) {
					return (scriptTag.match(WinletJSEngine.reScriptOne) || [
							'', '', '' ])[1];
				});
		var scriptLanguage = $.map(scriptDef, function(scriptTag) {
			return (scriptTag.match(WinletJSEngine.reScriptLanguage) || [ '',
					'' ])[1];
		});
		var scriptSrc = $.map(scriptDef,
				function(scriptTag) {
					return (scriptTag.match(WinletJSEngine.reScriptSrc) || [
							'', '' ])[1];
				});
		var scriptType = $.map(scriptDef,
				function(scriptTag) {
					return (scriptTag.match(WinletJSEngine.reScriptType) || [
							'', '' ])[1];
				});
		var scriptCharset = $
				.map(scriptDef,
						function(scriptTag) {
							return (scriptTag
									.match(WinletJSEngine.reScriptCharset) || [
									'', '' ])[1];
						});

		var elmHead = document.getElementsByTagName("head")[0];
		var elmScripts = elmHead.getElementsByTagName("script");
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

			var dtd = $.Deferred();

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
				dtd.resolve();
			}).on('readystatechange', function() {
				if (newScript.readyState == 'loaded') {
					dtd.resolve();
				}
			});

			elmHead.appendChild(newScript);
			newScript.src = scriptSrc[i];
			ret[ret.length] = dtd.promise();
		}

		$.when.apply($, ret).done(function() {
			for (i = 0; i < scriptContent.length; i++)
				try {
					eval(WinletJSEngine.procWinFunc(scriptContent[i], $container));
				} catch (e) {
					alert(e.message);
					alert(scriptContent[i]);
				}
		});
	},

	invokeAfterLoad : function() {
		if (WinletJSEngine.afterLoad) {
			try {
				WinletJSEngine.afterLoad();
			} catch (e) {
			}
		}
	},

	enableForm : function($winlet, $container) {
		$container.find("form[data-winlet-form]").each(function() {
			var form = $(this);
			var settings = {
				focus: form.attr("data-winlet-focus"),
				update: form.attr("data-winlet-update"),
				validate: form.attr("data-winlet-validate"),
				hideloading: form.attr("data-winlet-hideloading"),
				winlet: $winlet,
				container: ($container == null ? $winlet : $container)
			};

			form.winform(settings);
		});
	},

	updateHref : function(container) {
		container.find("a[data-winlet-href]").each(function() {
			var href = $(this).data("winlet-href");
			if (WinletJSEngine.startsWith(href, "javascript:"))
				$(this).attr("href", href);
			else {
				try {
					$(this).attr("href", eval(href));
				} catch (e) {
				}
			}
		});
	},

	/**
	 * Window方法执行返回结果的处理
	 * 
	 * @param $winlet
	 * @param focus
	 * @returns {Function}
	 */
	getWindowResponseHandler : function($winlet, $container, focus) {
		if ($container == null)
			$container = $winlet;

		return function(data, textStatus, jqXHR) {
			if ($winlet.length == 0)
				return;

			var redirect = jqXHR.getResponseHeader('X-Winlet-Redirect');
			if (redirect != null && redirect != "") {
				location.href = redirect;
				return;
			}

			var dialog = false;
			if (WinletJSEngine.isRootWinlet($container)
					&& WinletJSEngine.getWinSettings($container).dialog == "yes") {
				dialog = true;

				var title = WinletJSEngine._utf8_decode(jqXHR
						.getResponseHeader('X-Winlet-Title'));
				WinletJSEngine.openDialog($winlet, $container, data, title);
			} else {
				$container.html(WinletJSEngine.procStyle(WinletJSEngine
						.procWinFunc(data.replace(WinletJSEngine.reScriptAll,
						''), $container, null)));
				$(function() {
					WinletJSEngine.enableForm($winlet, $container);
					WinletJSEngine.updateHref($container);
				});

				WinletJSEngine.procScript(data, $container, null);
			}

			WinletJSEngine.invokeAfterLoad();
			WinletJSEngine.clearLoading($container);
			$winlet.trigger("WinletWindowLoaded", $winlet);

			if (!dialog && focus)
				WinletJSEngine.ensureVisible($container);
		};
	},

	loadContent : function($winlet, focus, pageRefresh) {
		if ($winlet == null || $winlet.length != 1)
			return;

		WinletJSEngine.showLoading($winlet);

		$.ajax({
			type : 'POST',
			url : WinletJSEngine.getWinletUrl($winlet),
			data : WinletJSEngine.mergeParam($winlet, null, {
				_x : 'y',
				_pg : window.location.pathname,
				_purl : window.location.href,
				_pr : pageRefresh ? "yes" : "no"
			}),
			success : WinletJSEngine.getWindowResponseHandler($winlet, null, focus),
			error : WinletJSEngine.getErrorHandler(),
			dataType : "html"
		});
	},

	updateWindows : function($winlet, wins) {
		if (wins == null || wins == '')
			return;

		var update = wins.split(',');
		var i;
		var unknown = null;
		for (i = 0; i < update.length; i++) {
			try {
				var ud = update[i];
				var focus = false;
				if (ud.indexOf("!") == 0) {
					focus = true;
					ud = ud.substring(1);
				}

				if (ud.indexOf("/") == 0)
					ud = ud.substring(1);

				if (ud.indexOf("/") >= 0)
					ud = WinletJSEngine.getContextRoot($winlet) + ud;
				else
					ud = WinletJSEngine.getWinletRoot($winlet) + ud;

				$('div[data-winlet-url="' + ud + '"]').each(function() {
					WinletJSEngine.loadContent($(this), focus);
				});
			} catch (e) {
			}
		}
	},

	/**
	 * Action方法执行返回结果的处理
	 * 
	 * @param $winlet
	 * @returns {Function}
	 */
	getActionResponseHandler : function($winlet, $container, focus) {
		var form = null;
		var funcs = null;

		if ($container == null)
			$container = $winlet;

		for (var i = 3; i < arguments.length; i++) {
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
			var redirect = jqXHR.getResponseHeader('X-Winlet-Redirect');
			var update = jqXHR.getResponseHeader('X-Winlet-Update');
			var dialog = jqXHR.getResponseHeader('X-Winlet-Dialog');
			var cache = jqXHR.getResponseHeader('X-Winlet-Cache');
			var title = WinletJSEngine._utf8_decode(jqXHR
					.getResponseHeader('X-Winlet-Title'));
			// var msg = jqXHR.getResponseHeader('X-Winlet-Msg');

			if (redirect != null && redirect != "") {
				location.href = redirect;
				return;
			}

			if (update == "page") {
				location.reload();
				return;
			}

			WinletJSEngine.clearLoading($container);

			if (update == "winlet") {
				WinletJSEngine.loadContent($winlet);
				return;
			}

			// 只有处理表单提交响应时form参数才不为null。如果时直接调用action或者翻译窗口url，form参数都为空
			if (form != null && dialog != "yes"
					&& data.indexOf("WINLET_FORM_RESP:") == 0) {
				// 提交表单并且表单校验出错
				WinletJSEngine.form.validateClearAll(form);
				WinletJSEngine.form.applyChanges(data.substr(17), form);

				if (form.onerror != undefined) {
					try {
						form.onerror(null);
					} catch (e) {
					}
				}
				return;
			}

			var d;
			if (dialog != "yes")
				d = WinletJSEngine.closeDialog($winlet);
			else {
				d = $.Deferred();
				d.resolve();
			}

			d.done(function() {
				var dataProcessed = false;
				if (funcs != null) {
					for (var i = 0; i < funcs.length; i++) {
						try {
							var ret = funcs[i](data, textStatus, jqXHR, $winlet);

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

				if (dialog == "yes") {
					if (!dataProcessed)
						WinletJSEngine.openDialog($winlet, $container, data, title);
				} else {
					if (!dataProcessed && !(cache == "yes"))
						WinletJSEngine.getWindowResponseHandler($winlet, $container, focus)(data, textStatus,
								jqXHR);
				}

				WinletJSEngine.updateWindows($winlet, update);
			});
		};
	},

	// 简单的错误处理 － 刷新当前页面
	getErrorHandler : function($winlet) {
		return function(req, textStatus, errorThrown) {
			// document.location.reload(true);
		};
	},

	isInt : function(n) {
		return n != undefined && n != null && Number(n) === n && n % 1 === 0;
	},

	/***************************************************************************
	 * 
	 * 扫描<div id="winlet:">标签，在其中生成<div id="ap_win_">标签，并为生成的标签设置settings属性对象。
	 * settings中可以包含以下属性： hashgroup 该window所属的参数组。相同组的window共享hash参数 dialog
	 * 如果值为yes表示用弹出对话框显示窗口 close 对于弹出对话框显示的窗口，关闭窗口时调用的Winlet的方法 url
	 * Winlet的窗口的URL
	 * 
	 * 根窗口才有settings和hashgroup，子窗口共享根窗口的settings和hashgroup
	 * 
	 **************************************************************************/
	setup : function(settings) {
		if (settings) {
			if (settings.analytic)
				WinletJSEngine.analytic = settings.analytic;
			if (WinletJSEngine.isInt(settings.left))
				WinletJSEngine.leftSpace = settings.left;
			if (WinletJSEngine.isInt(settings.right))
				WinletJSEngine.rightSpace = settings.right;
			if (WinletJSEngine.isInt(settings.top))
				WinletJSEngine.topSpace = settings.top;
			if (WinletJSEngine.isInt(settings.bottom))
				WinletJSEngine.bottomSpace = settings.bottom;
		}
	},

	winletId: 1,

	init : function(settings, hashchange) {
		WinletJSEngine.setup(settings);

		if (!hashchange) { // 初次初始化
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

				$('div[data-winlet]').each(
					function() { // 强制预加载窗口和include子窗口没有data-winlet属性，不会被处理
						var preloaded = $(this).data("winlet-url") != null;

						var match = $(this).data("winlet").match(
								WinletJSEngine.reWinlet);

						var url = match[1];
						if (!url.indexOf("/") == 0)
							url = "/" + url;
						$(this).attr("data-winlet-url", url);

						// 提取data-winlet中的参数
						if (match.length > 5 && match[5] != null
								&& match[5] != null)
							$(this).attr(
									"data-winlet-params",
									JSON.stringify($
											.deparam(match[5])));

						// 提取data-winlet中的设置
						if (match.length > 7 && match[7] != null
								&& match[7] != '') {
							var settings = {};

							var params = match[7].split(',');
							var i;

							for (i = 0; i < params.length; i++) {
								var pmatch = params[i]
										.match(WinletJSEngine.reWinletParam);
								settings[pmatch[1]] = pmatch[2];
							}

							if ('yes' == settings['root']
									&& WinletJSEngine.hashGroupMap['root'] == null) // 占用root
																					// hash
																					// group
								WinletJSEngine.hashGroupMap[WinletJSEngine
										.getWinletRoot($(this))] = 'root';

							$(this).attr("data-winlet-settings",
									JSON.stringify(settings));
						}

						if (preloaded) { // winlet已经在服务器端预加载
							if (hasHash) // 客户端已经有状态数据，需要重新加载。winlet可以通过pageUrl访问所有hash数据，不一定只使用其hashgroup中的数据
								WinletJSEngine.loadContent($(this), false,
										true);
						} else { // winlet未在服务器端预加载，分配id，加载内容
							// ID不会被传送给服务器端。分配ID的目的是为了让javascript脚本
							// 能够找到所属的winlet 
							$(this).attr("data-winlet-id", ++WinletJSEngine.winletId);
							WinletJSEngine.loadContent($(this), false,
									true);
						}
					});
			});
		} else { // 回退按钮改变hash导致重新加载窗口
			$('div[data-winlet]').each(
					function() { // 强制预加载窗口和include子窗口没有data-winlet属性，不会被处理
						WinletJSEngine.loadContent($(this), false, true);
					});
		}
	}
};

var win$ = {
	/**
	 * 将参数转成JSON格式。
	 * 
	 * @param params
	 *            要转换的对象，可以为表单名称，表单对象，JSON数据或URL param格式的字符串
	 * @returns
	 */
	getParams : function(params, $winlet, $container) {
		try {
			if (typeof params == "string") { // 类型为字符串
				if (params.indexOf("{") == 0) { // json字符串
					return $.parseJSON(params);
				}
				if (params.indexOf("=") > 0) // URL param格式字符串
					return $.deparam(params);
				else
					// params为form name
					params = WinletJSEngine.getForm($winlet, $container, params);
			}

			if (params.is('form'))
				return $.deparam(params.serialize());
		} catch (e) {
		}

		return params;
	},

	_winlet: function(element) {
		return WinletJSEngine.getWinlet(element);
	},

	_post : function(element, container, action) {
 		var $container = null;
		if (container != null) {
			if (container instanceof jQuery)
				$container = container;
			else if (typeof container === "string")
				$container = $('#' + container);
			
			if ($container.length != 1) //找不到指定的container，或不只1个匹配
				return false;

			if ($container.data("winlet-id") == null || $container.data("winlet-id") == '')
				$container.attr("data-winlet-id", ++WinletJSEngine.winletId);
		}

		if ($container == null)
			$container = WinletJSEngine.getContainer(element);
		if ($container == null)
			return false;

		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;

		var params = {};
		var funcs = [];
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

			if (!winlet.indexOf("/") == 0)
				winlet = "/" + winlet;

			switch ((winlet.match(/\//g) || []).length) {
			case 1:
				winlet = WinletJSEngine.getWinletRoot($winlet) + winlet.substring(1);
				break;
			case 2:
				winlet = WinletJSEngine.getContextRoot($winlet) + winlet.substring(1);
				break;
			}

			$winlet = $('div[data-winlet-url="' + winlet + '"]');
			if ($winlet.length == 0)
				return false;

			if ($winlet.length > 1)
				$winlet = $($winlet[0]);
		}

		if (hash != null)
			WinletJSEngine.setHash($winlet, hash);

		for (var i = 3; i < arguments.length; i++) {
			if (arguments[i] == null)
				continue;

			if (typeof arguments[i] === 'function')
				funcs[funcs.length] = arguments[i];
			else
				$.extend(params, win$.getParams(arguments[i], $winlet, $container));
		}

		if ($container.data("winlet-url") == null) // 把参数保存到$container中
			$container.attr("data-winlet-params", JSON.stringify(params));

		$.ajax({
			type : 'POST',
			url : WinletJSEngine.getWinletUrl($winlet),
			data : WinletJSEngine.mergeParam($winlet, null, params, {
				_x : 'y',
				_a : action,
				_pg : window.location.pathname,
				_purl : window.location.href,
				_c: ($container[0] == $winlet[0] ? 'n' : 'y')
			}),
			success : WinletJSEngine.getActionResponseHandler($winlet, $container, focus, funcs),
			error : WinletJSEngine.getErrorHandler($winlet),
			dataType : "html"
		});

		return false;
	},

	_ajax : function(element, paramFunc) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;
		var $container = WinletJSEngine.getContainer(element);

		$.ajax(paramFunc($winlet, $container));
		
		return false;
	},

	_get : function(element, param) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;
		var $container = WinletJSEngine.getContainer(element);

		var reload = true;
		var update = null;
		var focus = true;

		if (param != null)
			if (typeof param == "object") {
				for ( var prop in param) {
					if ("reload" == prop)
						reload = param[prop];
					if ("update" == prop)
						update = param[prop];
					if ("focus" == prop)
						focus = param[prop];
				}
			} else {
				update = param;
			}

		var params = {};

		for (var i = 2; i < arguments.length; i++) {
			$.extend(params, win$.getParams(arguments[i], $winlet, $container));
		}

		var focusUpdate = false;
		if (update && update.indexOf("!") >= 0)
			focusUpdate = true;

		WinletJSEngine.setHash($winlet, params);
		if (reload)
			WinletJSEngine.loadContent($winlet, focus && !focusUpdate);
		if (update)
			WinletJSEngine.updateWindows($winlet, update);
		
		return false;
	},

	_toggle : function(element, update) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;
		var $container = WinletJSEngine.getContainer(element);

		var params = {};

		for (var i = 2; i < arguments.length; i++) {
			$.extend(params, win$.getParams(arguments[i], $winlet, $container));
		}

		WinletJSEngine.setHash($winlet, params, true);

		WinletJSEngine.loadContent($winlet);
		WinletJSEngine.updateWindows($winlet, update);

		return false;
	},

	_url : function(element, action) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return null;
		var $container = WinletJSEngine.getContainer(element);

		var params = {};

		for (var i = 2; i < arguments.length; i++)
			$.extend(params, win$.getParams(arguments[i], $winlet, $container));

		return WinletJSEngine.getWinletUrl($winlet) + "?"
				+ WinletJSEngine.mergeParam($winlet, null, params, {
					_x : 'y',
					_a : action,
					_pg : window.location.pathname,
					_purl : window.location.href
				});
	},

	reAction : new RegExp('^(.*)\\?_a=(.*)$'),

	_submit : function(element, form, action) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;
		var $container = WinletJSEngine.getContainer(element);

		var f = null;
		if (typeof form === 'string')
			f = WinletJSEngine.getForm($winlet, $container, form);
		else {
			try {
				f = $(form).closest("form");
			} catch (e) {
			}
		}
		if (f == null || f.length != 1)
			return false;

		if (action != null && action != '') {
			if (!f.attr('action').match(win$.reAction))
				return false;
			f.attr('action', f.attr('action').replace(win$.reAction,
					"$1?_a=" + action));
		}

		var params = {};
		for (var i = 3; i < arguments.length; i++) {
			if (arguments[i] == null)
				continue;

			$.extend(params, win$.getParams(arguments[i], $winlet, $container));
		}

		for ( var key in params) {
			f.find("input[name=" + key + "]").attr("value", params[key]);
		}

		f.submit();
		
		return false;
	},

	_aftersubmit : function(element, form) {
		var $winlet = WinletJSEngine.getWinlet(element);
		if ($winlet == null)
			return false;
		var $container = WinletJSEngine.getContainer(element);

		var f = WinletJSEngine.getForm($winlet, $container, form);
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
			return false;
		return $container.find(query);
	},

	/**
	 * 返回一个promise，用于等待页面中出现selector对应的元素，等待时间不超过maxwait
	 */
	_wait : function(element, selector, maxwait) {
		var $container = WinletJSEngine.getContainer(element);
		if ($container == null)
			return false;

		var start = (new Date()).getTime();
		var dtd = $.Deferred();

		(function() {
			if ($container.find(selector) == undefined) {
				if (maxwait != null && (new Date()).getTime() - start > maxwait)
					dtd.reject();
				else
					window.setTimeout(arguments.callee, 300);
			} else {
				dtd.resolve();
			}
		})();

		return dtd.promise();
	}
};

$(window).hashchange(function() {
	if (WinletJSEngine.detectHashChange)
		WinletJSEngine.init(null, true);
	else
		WinletJSEngine.detectHashChange = true;
});
