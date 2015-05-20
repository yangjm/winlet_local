WinletJSEngine.getDialog = function($winlet, createIfNotExist) {
	if ($winlet == null || $winlet.length != 1)
		return null;

	var dlg = $winlet.find('div[data-winlet-dialog="yes"]');
	if (dlg.length == 0 || WinletJSEngine.getWinlet(dlg[0])[0] != $winlet[0]) {
		if (!createIfNotExist)
			return null;

		dlg = $('<div class="modal fade" data-winlet-dialog="yes" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">&nbsp;</h4></div><div class="modal-body">Body</div><div class="modal-footer">&nbsp;</div></div></div></div>');
		$winlet.append(dlg);
		dlg.on('show.bs.modal', function() {
		    $(this).css('display', 'block');
		    var $dialog = $(this).find(".modal-dialog");
		    var offset = ($(window).height() - $dialog.height()) / 3;
		    // Center modal vertically in window
		    $dialog.css("margin-top", offset);
		});
	}
	
	return dlg;
}

/**
 * 返回deferred对象，resolve了表示对话框完成关闭。
 * 如果在完成对话框关闭前把对话框从dom中去除，会导致对话框关闭不完整，挡住页面的背景div不会被正常清除
 */
WinletJSEngine.closeDialog = function($winlet) {
	var d = $.Deferred();

	var dlg = WinletJSEngine.getDialog($winlet, false);
	if (dlg == null) {
		d.resolve();
		return d;
	}

	try {
		if (dlg.hasClass('in')) // http://stackoverflow.com/questions/19674701/can-i-check-if-bootstrap-modal-shown-hidden
			dlg.off('hidden.bs.modal').on('hidden.bs.modal', function(){
				d.resolve();
			}).modal('hide');
		else
			d.resolve();
	} catch (e) {
		d.resolve();
	}
	dlg.find("div.modal-body").empty();

	return d;
};

WinletJSEngine.openDialog = function($winlet, content, title) {
	var dlg = WinletJSEngine.getDialog($winlet, true);

	var body = dlg.find("div.modal-body"); 
	var html = $.trim(WinletJSEngine.procStyle(WinletJSEngine.procWinFunc(
			content.replace(WinletJSEngine.reScriptAll, '')
			.replace(WinletJSEngine.reDialogSetting, ''), $winlet)));

	if (html == '') {
		WinletJSEngine.closeDialog($winlet);
		return;
	}

	body.empty().append(html);

	var settings = WinletJSEngine.reDialogSetting.exec(content);
	if (settings != null) {
		settings = JSON.parse(WinletJSEngine.procWinFunc(settings[1], $winlet));
		dlg.find("h4.modal-title").empty().append(settings.title);
		
		if (settings.width && settings.width != '')
			dlg.find('.modal-dialog').css("width", settings.width);
		else
			dlg.find('.modal-dialog').css("width", "");

		var footer = dlg.find("div.modal-footer").empty();
		for (var i = 0; i < settings.buttons.length; i++) {
			var button = "<button type=\"button\"";
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

		body.find("form[data-winlet-form]").each(function() {
			var form = $(this);
			form.winform({
				focus: form.attr("data-winlet-focus"),
				update: form.attr("data-winlet-update"),
				validate: form.attr("data-winlet-validate"),
				hideloading: form.attr("data-winlet-hideloading"),
				dialog: dlg});

			if (form.attr("data-winlet-focus"))
				focus = form.find('input[name="' + form.attr("data-winlet-focus") + '"]');
		});

		WinletJSEngine.procScript(content, $winlet);

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
