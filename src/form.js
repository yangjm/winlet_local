/**
 * Form initialization - replaces $.fn.winform
 */
import { WinletJSEngine } from './engine.js';
import { deparam } from './utils/deparam.js';
import { ajax } from './utils/ajax.js';
import { Deferred, whenAll } from './utils/deferred.js';
import { serializeForm } from './utils/dom.js';

export function winform(formEl, settings) {
	settings = Object.assign({}, settings);

	if (formEl.winsubmit)
		return;

	formEl.getSettings = function() {
		return settings;
	};

	var form = formEl;

	try {
		if (!formEl.getAttribute("action").match(WinletJSEngine.reAction)) {
			form.winletAction = WinletJSEngine.getWinletUrl(settings.container) + "?_a=" + formEl.getAttribute("action");
		} else {
			form.winletAction = formEl.getAttribute("action");
		}
	} catch {}

	form.winsubmit = function(_state) {
		var dfd = form.windeferred;
		form.windeferred = null;
		if (dfd == null)
			dfd = Deferred();

		if (form.onsubmit != null)
			try {
				if (!form.onsubmit()) {
					dfd.reject();
					return false;
				}
			} catch {
				dfd.reject();
				return false;
			}

		var container = settings.container;
		if (container == null) {
			dfd.reject();
			return false;
		}

		var target = settings.target ? settings.target : container;

		if (formEl.getAttribute("enctype") == "multipart/form-data") {
			form.action = form.winletAction + "&" + WinletJSEngine.mergeParam(container, {
				_pg: window.location.pathname,
				_purl: window.location.href,
				_dn: WinletJSEngine.winletDomain
			});
			dfd.resolve();
			return true;
		}

		if (formEl.getAttribute('method').toUpperCase() != 'POST') {
			// GET handling
			var params = deparam(serializeForm(formEl));
			formEl.querySelectorAll(":is(input)[type='checkbox']").forEach(function(cb) {
				if (params[cb.name] == undefined)
					params[cb.name] = "";
			});
			WinletJSEngine.setHash(container, params);

			if (settings.update == "parent") {
				var parentWinlet = WinletJSEngine.getWinlet(
					WinletJSEngine.traceToWinlet(container).parentElement);
				if (parentWinlet != null) {
					WinletJSEngine.loadContent(parentWinlet).then(function() {
						dfd.resolve();
					}).catch(function() {
						dfd.reject();
					});
					return false;
				}
				dfd.reject();
				return false;
			}

			whenAll([
				WinletJSEngine.loadContent(container),
				WinletJSEngine.updateWindows(container, settings.update, form.nofocus || !settings.winFocus)
			]).then(function() {
				dfd.resolve();
			}).catch(function() {
				dfd.reject();
			});
			return false;
		}

		// POST handling
		try {
			if (settings.hideloading != 'yes')
				WinletJSEngine.showLoading(target, settings.dialog);
		} catch {}

		var disabled = [];
		var disabledInputs = formEl.querySelectorAll(":is(input, select, textarea):disabled");
		for (var i = 0; i < disabledInputs.length; i++)
			if (disabledInputs[i].name != '')
				disabled.push(disabledInputs[i].name);

		var fields = [];
		var allInputs = formEl.querySelectorAll(":is(input, select, textarea)");
		for (var j = 0; j < allInputs.length; j++)
			if (allInputs[j].name != '')
				fields.push(allInputs[j].name);

		var fullUrl = WinletJSEngine.getFullUrl(form.winletAction);
		ajax({
			type: 'POST',
			url: fullUrl,
			data: WinletJSEngine.mergeParam(container,
				deparam(serializeForm(formEl)), {
					_x: 'y',
					_v: settings.validate,
					_ff: fields,
					_fd: disabled,
					_pg: window.location.pathname,
					_purl: window.location.href,
					_c: (target.getAttribute("data-winlet-url") == null ? 'y' : 'n'),
					_dn: WinletJSEngine.winletDomain
				}),
			success: function(data, textStatus, jqXHR) {
				WinletJSEngine.getActionResponseHandler(
					target, settings.winFocus, form,
					form.aftersubmit)(data, textStatus, jqXHR)
				.then(function() { dfd.resolve(); })
				.catch(function() { dfd.reject(); });
			},
			error: function(req, textStatus, errorThrown) {
				WinletJSEngine.getErrorHandler(target)(req, textStatus, errorThrown);
				dfd.reject();
			},
			dataType: "text"
		});
		WinletJSEngine.analyticAction(fullUrl);

		return false;
	};

	form.ajaxValidate = function(input, name, value) {
		if (name == undefined)
			name = input.name;

		var container = settings.container;
		if (container == null)
			return false;

		WinletJSEngine.form.validating(input);

		var val = value;

		if (input.type == 'checkbox') {
			if (input.checked)
				val = input.value;
		} else
			val = input.value;

		var paramObj = {
			_vf: name,
			_vv: val,
			_vid: input.id
		};

		// Serialize just this input
		var inputData = {};
		if (input.name) inputData[input.name] = input.value;
		Object.assign(paramObj, inputData);

		// Also include hidden fields from the form
		formEl.querySelectorAll(":is(input)[type='hidden']").forEach(function() {
			Object.assign(paramObj, deparam(serializeForm(formEl)));
		});

		var fullUrl = WinletJSEngine.getFullUrl(form.winletAction);
		ajax({
			type: 'POST',
			url: fullUrl,
			data: WinletJSEngine.mergeParam(container, paramObj, {
				_x: 'y',
				_pg: window.location.pathname,
				_purl: window.location.href,
				_dn: WinletJSEngine.winletDomain
			}),
			success: WinletJSEngine.form.getValidateResponseHandler(formEl, name, input),
			dataType: "json"
		});
		WinletJSEngine.analyticValidate(fullUrl);
	};

	formEl.addEventListener('submit', function(e) {
		e.preventDefault();
		form.winsubmit();
	});

	if (settings.focus) {
		var inp = formEl.querySelector(':is(input, textarea)[name="' + settings.focus + '"]');
		if (inp) {
			try { inp.select(); } catch {}
			inp.focus();
		}
	}

	form.setAction = function(action) {
		if (action == null || action == '')
			return;

		if (!formEl.getAttribute('action').match(WinletJSEngine.reAction)) {
			formEl.setAttribute('action', action);
			form.winletAction = WinletJSEngine.getWinletUrl(settings.container) + "?_a=" + action;
		} else {
			action = formEl.getAttribute('action').replace(WinletJSEngine.reAction, "$1?_a=" + action);
			formEl.setAttribute('action', action);
			form.winletAction = action;
		}
	};

	form.updateValidate = function() {
		if (settings.validate == 'yes') {
			formEl.querySelectorAll(":is(input, select, textarea)").forEach(function(inputEl) {
				if (inputEl.name == null || inputEl.name == '')
					return;

				if (inputEl.closest("[data-validate='no']") != null)
					return;

				if (inputEl.tagName == 'INPUT') {
					var type = inputEl.type;
					if (!(type == "text" || type == "email" || type == "checkbox" || type == "radio" || type == "password"))
						return;
				}

				if (inputEl.getAttribute("tips") != undefined) {
					inputEl.addEventListener("focus", function() {
						WinletJSEngine.form.showTip(this);
					});
					inputEl.addEventListener("blur", function() {
						WinletJSEngine.form.hideTip(this);
					});
				}

				if (inputEl.winletAjaxValidate == null) {
					inputEl.winletAjaxValidate = true;
					inputEl.addEventListener('change', function() {
						this.form.ajaxValidate(this);
					});
				}
			});
		}
	};

	form.updateValidate();
}
