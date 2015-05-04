WinletJSEngine.centerModal = function() {
    $(this).css('display', 'block');
    var $dialog = $(this).find(".modal-dialog");
    var offset = ($(window).height() - $dialog.height()) / 3;
    // Center modal vertically in window
    $dialog.css("margin-top", offset);
}

WinletJSEngine.getDialog = function(wid) {
	if (wid != null) {
		var dlg = $("div#ap_win_" + wid + "_dialog");
		if (dlg.length == 0) {
			dlg = $('<div class="modal fade" id="ap_win_' + wid + '_dialog" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">&nbsp;</h4></div><div class="modal-body">Body</div><div class="modal-footer">&nbsp;</div></div></div></div>');
			$("div#ap_win_" + wid).append(dlg);
			dlg.on('show.bs.modal', WinletJSEngine.centerModal);
		}
		
		return dlg;
	} else {
		if (WinletJSEngine.dlg == null) {
			WinletJSEngine.dlg = $('<div class="modal fade" id="AeDialog" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">&nbsp;</h4></div><div class="modal-body">Body</div><div class="modal-footer">&nbsp;</div></div></div></div>');
			$(document.body).append(WinletJSEngine.dlg);
			WinletJSEngine.dlg.on('show.bs.modal', WinletJSEngine.centerModal);
		}
		
		return WinletJSEngine.dlg;
	}
}

WinletJSEngine.closeDialog = function(wid) {
	var dlg = WinletJSEngine.getDialog(wid);

	try {
		if (dlg.hasClass('in')) // http://stackoverflow.com/questions/19674701/can-i-check-if-bootstrap-modal-shown-hidden
			dlg.modal('hide');
	} catch (e) {
	}
	dlg.find("div.modal-body").empty();
};

WinletJSEngine.openDialog = function(shared, wid, content, title) {
	var dlg = WinletJSEngine.getDialog(shared ? null : wid);

	var body = dlg.find("div.modal-body"); 
	var html = $.trim(WinletJSEngine.procStyle(WinletJSEngine.procWinFunc(content.replace(WinletJSEngine.reScriptAll, '')
			.replace(WinletJSEngine.reDialogSetting, ''), wid)));

	if (!shared && html == '') {
		WinletJSEngine.closeDialog(wid);
		return;
	}

	body.empty().append(html);

	var settings = WinletJSEngine.reDialogSetting.exec(content);
	if (settings != null) {
		settings = JSON.parse(WinletJSEngine.procWinFunc(settings[1], wid));
		dlg.find("h4.modal-title").empty().append(settings.title);
		
		if (settings.width && settings.width != '')
			dlg.find('.modal-dialog').css("width", settings.width);
		else
			dlg.find('.modal-dialog').css("width", "");

		var footer = dlg.find("div.modal-footer").empty();
		for (var i = 0; i < settings.buttons.length; i++) {
			var button = "<button";
			for (var prop in settings.buttons[i]) {
				if (prop != 'label')
					button = button + " " + prop + "=\"" + settings.buttons[i][prop] + "\"";
			}

			button = button + ">" + settings.buttons[i].label + "</button>";
			footer.append(button);
		}
	} else if (title != null) {
		dlg.find("h4.modal-title").empty().append(title);
	}

	$(function() {
		var focus = null;

		body.find("form[data-winlet-wid]").each(function() {
			var form = $(this);
			form.winform({
				wid: form.attr("data-winlet-wid"),
				focus: form.attr("data-winlet-focus"),
				update: form.attr("data-winlet-update"),
				validate: form.attr("data-winlet-validate"),
				hideloading: form.attr("data-winlet-hideloading"),
				dialog: dlg});

			if (form.attr("data-winlet-focus"))
				focus = form.find('input[name="' + form.attr("data-winlet-focus") + '"]');
		});

		WinletJSEngine.procScript(wid, content);

		if (focus) {
			dlg.off('shown.bs.modal').on('shown.bs.modal', function () {
			    focus.select();
			    focus.focus();
			});
		}

		dlg.modal('show');
	});
};


WinletJSEngine.form.validateSuccess = function(input) {
	var result = WinletJSEngine.form.getInputResult(input);
	if (result != null) {
		var parents = result.parents("div.form-group");
		if (parents.length > 0)
			$(parents[0]).removeClass("has-error").addClass("has-success");
	}
};

WinletJSEngine.form.validateError = function() {
	var original = WinletJSEngine.form.validateError;
	return function(input, msg) {
		original(input, msg);

		var result = WinletJSEngine.form.getInputResult(input);
		if (result != null) {
			var parents = result.parents("div.form-group");
			if (parents.length > 0)
				$(parents[0]).removeClass("has-success").addClass("has-error");
		}
	};
}();
