import { WinletJSEngine } from './core.js';
import { qsa } from '../utils/dom.js';

WinletJSEngine.form = {
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

	validating: function(_input) {},

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
		} catch (e) { console.error("[winlet] eval failed:", e, "json:", json); }

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
				} catch {}
			}
		}
	},

	getValidateResponseHandler: function(form, name, input) {
		return function(json) {
			WinletJSEngine.form.validateClear(input);
			WinletJSEngine.form.applyChanges(json, form, input);

			if (form.onerror != undefined && input != undefined) {
				try { form.onerror(input); } catch {}
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
};
