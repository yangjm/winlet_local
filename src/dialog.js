/**
 * Dialog integration - wires the custom modal into WinletJSEngine.
 * Replaces winlet_bootstrap.js entirely.
 */
import { createModal, showModal, hideModal, isModalShown } from './modal.js';
import { Deferred } from './utils/deferred.js';
import { domReady } from './utils/dom.js';

export function installDialog(WinletJSEngine, winformFn) {

	WinletJSEngine.getDialog = function(container, createIfNotExist) {
		var winlet = WinletJSEngine.traceToWinlet(container);
		if (winlet == null)
			return null;

		if (winlet.dlg == null) {
			if (!createIfNotExist)
				return null;
			winlet.dlg = createModal();
		}
		return winlet.dlg;
	};

	WinletJSEngine.closeDialog = function(container) {
		var dfd = Deferred();

		var dlg = WinletJSEngine.getDialog(container, false);
		if (dlg == null) {
			dfd.resolve();
			return dfd.promise();
		}

		try {
			if (isModalShown(dlg)) {
				hideModal(dlg, function() {
					dfd.resolve();
				});
			} else {
				dfd.resolve();
			}
		} catch {
			dfd.resolve();
		}

		var body = dlg.querySelector(".winlet-modal-body");
		if (body) body.innerHTML = '';

		return dfd.promise();
	};

	WinletJSEngine.openDialog = function(container, content, title) {
		var dlg = WinletJSEngine.getDialog(container, true);

		var body = dlg.querySelector(".winlet-modal-body");
		var html = (WinletJSEngine.procStyle(WinletJSEngine.procWinFunc(
			content.replace(WinletJSEngine.reScriptAll, '')
			.replace(WinletJSEngine.reDialogSetting, ''), container)) || '').trim();

		if (html == '') {
			WinletJSEngine.closeDialog(container);
			return;
		}

		body.innerHTML = '<div data-winlet-src-id="' + container.dataset.winletId + '">' + html + '</div>';

		var dialogEl = dlg.querySelector('.winlet-modal-dialog');

		var settings = WinletJSEngine.reDialogSetting.exec(content);
		if (settings != null) {
			settings = JSON.parse(WinletJSEngine.procWinFunc(settings[1], container));

			var titleEl = dlg.querySelector("h4.winlet-modal-title");
			titleEl.innerHTML = settings.title || '&nbsp;';

			if (settings['class'] && settings['class'] != '')
				dialogEl.classList.add(settings['class']);

			if (settings.width && settings.width != '')
				dialogEl.style.width = settings.width;
			else if (settings.maxwidth && settings.maxwidth != '') {
				try {
					var maxwidth = parseInt(settings.maxwidth);
					var padding = 0;
					var width = WinletJSEngine.getViewport().width;

					if (settings.padding && settings.padding != '')
						padding = parseInt(settings.padding);
					if (width > maxwidth + padding * 2)
						dialogEl.style.width = Math.round(maxwidth / width * 100) + "%";
					else
						dialogEl.style.width = "";
				} catch (e) {
					console.log(e);
				}
			} else {
				dialogEl.style.width = "";
			}

			var footer = dlg.querySelector(".winlet-modal-footer");
			if (settings.buttons) {
				footer.innerHTML = '';
				for (var i = 0; i < settings.buttons.length; i++) {
					var button = "<button type=\"button\"";
					for (var prop in settings.buttons[i]) {
						if (prop != 'label')
							button += " " + prop + "=\"" + settings.buttons[i][prop] + "\"";
					}
					button += ">" + settings.buttons[i].label + "</button>";
					footer.insertAdjacentHTML('beforeend', button);
				}
			} else {
				if (footer) footer.remove();
			}
		} else if (title != null) {
			var titleEl2 = dlg.querySelector("h4.winlet-modal-title");
			titleEl2.innerHTML = title;
		}

		domReady(function() {
			var focusEl = null;

			// Enable forms in dialog
			var forms = body.querySelectorAll("form");
			forms.forEach(function(formEl) {
				var attrs = formEl.attributes;
				var hasWinletAttr = false;
				for (var ai = 0; ai < attrs.length; ai++) {
					if (attrs[ai].name.indexOf("data-winlet-") == 0) {
						hasWinletAttr = true;
						break;
					}
				}
				if (!hasWinletAttr) return;

				var containing = WinletJSEngine.getContainer(formEl);

				var formSettings = {
					winFocus: true,
					focus: formEl.getAttribute("data-winlet-focus"),
					update: formEl.getAttribute("data-winlet-update"),
					validate: formEl.getAttribute("data-winlet-validate"),
					hideloading: formEl.getAttribute("data-winlet-hideloading"),
					container: containing == null ? container : containing,
					dialog: dlg
				};

				if ("true" == formEl.getAttribute("data-winlet-win-nofocus"))
					formSettings.winFocus = false;
				if (formSettings.validate == null || formSettings.validate == "")
					formSettings.validate = "form";

				winformFn(formEl, formSettings);

				if (formEl.getAttribute("data-winlet-focus")) {
					var fname = formEl.getAttribute("data-winlet-focus");
					focusEl = formEl.querySelector('input[name="' + fname + '"], textarea[name="' + fname + '"]');
				}
			});

			// Show modal, then execute scripts
			var onShown = function() {
				if (focusEl) {
					try { focusEl.select(); } catch {}
					focusEl.focus();
				}
				WinletJSEngine.procScript(content, container);
				WinletJSEngine.invokeAfterLoad(body);
			};

			if (isModalShown(dlg)) {
				onShown();
			} else {
				dlg.addEventListener('shown.winlet.modal', function handler() {
					dlg.removeEventListener('shown.winlet.modal', handler);
					onShown();
				});
				showModal(dlg);
			}
		});
	};

	// Override form validation functions to add .has-success/.has-error classes
	WinletJSEngine.form.validateClearAll = function(form) {
		if (!(form instanceof HTMLElement))
			return;
		var results = form.querySelectorAll("span.validate_result");
		results.forEach(function(result) {
			result.innerHTML = '';
			var parent = result.closest("div.form-group, .winlet-input-group");
			if (parent)
				parent.classList.remove("has-error", "has-success");
		});
	};

	WinletJSEngine.form.validateClear = function() {
		for (var i = 0; i < arguments.length; i++) {
			var result = WinletJSEngine.form.getInputResult(arguments[i]);
			if (result != null) {
				result.innerHTML = '';
				var parent = result.closest("div.form-group, .winlet-input-group");
				if (parent)
					parent.classList.remove("has-error", "has-success");
			}
		}
	};

	WinletJSEngine.form.validateSuccess = function(input) {
		var result = WinletJSEngine.form.getInputResult(input);
		if (result != null) {
			result.innerHTML = '';
			var parent = result.closest("div.form-group, .winlet-input-group");
			if (parent)
				parent.classList.remove("has-error");
				parent.classList.add("has-success");
		}
	};

	WinletJSEngine.form.validateError = (function() {
		var original = WinletJSEngine.form.validateError;
		return function(input, msg) {
			original(input, msg);
			var result = WinletJSEngine.form.getInputResult(input);
			if (result != null) {
				var parent = result.closest("div.form-group, .winlet-input-group");
				if (parent) {
					parent.classList.remove("has-success");
					parent.classList.add("has-error");
				}
			}
			return true;
		};
	})();
}
