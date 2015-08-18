WinletJSEngine.getDialog = function($container, createIfNotExist) {
	var $winlet = WinletJSEngine.traceToWinlet($container);
	if ($winlet == null || $winlet.length != 1)
		return null;

	if ($winlet[0].dlg == null) {
		if (!createIfNotExist)
			return null;

		$winlet[0].dlg = $('<div class="modal fade" data-winlet-dialog="yes" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">&nbsp;</h4></div><div class="modal-body">Body</div><div class="modal-footer">&nbsp;</div></div></div></div>');
		$(document.body).append($winlet[0].dlg);
		$winlet[0].dlg.on('show.bs.modal', function() {
		    $(this).css('display', 'block');
		    var $dialog = $(this).find(".modal-dialog");
		    var offset = ($(window).height() - $dialog.height()) / 3;
		    // Center modal vertically in window
		    $dialog.css("margin-top", offset);
		});
	}
	
	return $winlet[0].dlg;
}

/**
 * 返回deferred对象，resolve了表示对话框完成关闭。
 * 如果在完成对话框关闭前把对话框从dom中去除，会导致对话框关闭不完整，挡住页面的背景div不会被正常清除
 */
WinletJSEngine.closeDialog = function($container) {
	var d = $.Deferred();

	var dlg = WinletJSEngine.getDialog($container, false);
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

WinletJSEngine.openDialog = function($container, content, title) {
	var dlg = WinletJSEngine.getDialog($container, true);

	var body = dlg.find("div.modal-body"); 
	var html = $.trim(WinletJSEngine.procStyle(WinletJSEngine.procWinFunc(
			content.replace(WinletJSEngine.reScriptAll, '')
			.replace(WinletJSEngine.reDialogSetting, ''), $container)));

	if (html == '') {
		WinletJSEngine.closeDialog($container);
		return;
	}

	// 在对话框中添加一个容器窗口，如果对话框中包含子窗口的话，子窗口可以根据DOM关系寻找到这个容器窗口，然后
	// 沿着容器窗口的data-wnlet-src-id找到触发对话框的窗口，这样子窗口中执行post()等方法时可以获得完整
	// 的容器参数。对话框中的form也可以根据DOM关系找到容器窗口，然后找到触发对话框的窗口
	body.empty().append('<div data-winlet-src-id="' + $container.data("winlet-id") + '">' + html + '<div>');

	var settings = WinletJSEngine.reDialogSetting.exec(content);
	if (settings != null) {
		settings = JSON.parse(WinletJSEngine.procWinFunc(settings[1], $container));
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

		// 修改以下逻辑时请注意与winlet_local中的enableForm一致
		body.find("form[data-winlet-form]").each(function() {
			var form = $(this);
			// 对话框中的form如果是在对话框内容里的子窗口中，则$containing不为空。
			var $containing = WinletJSEngine.getContainer(form);

			form.winform({
				focus: form.attr("data-winlet-focus"),
				update: form.attr("data-winlet-update"),
				validate: form.attr("data-winlet-validate"),
				hideloading: form.attr("data-winlet-hideloading"),
				container: $containing == null ? $container : $containing,
				dialog: dlg});

			if (form.attr("data-winlet-focus"))
				focus = form.find('input[name="' + form.attr("data-winlet-focus") + '"]');
		});

		WinletJSEngine.procScript(content, $container);

		if (focus) {
			dlg.off('shown.bs.modal').on('shown.bs.modal', function () {
			    focus.select();
			    focus.focus();
			});
		}

		dlg.modal('show');
	});
};


WinletJSEngine.form.validateClearAll = function(form) {
	if (!(form instanceof jQuery))
		form = $(form);
	form.find("span.validate_result").each(function() {
		var result = $(this);
		result.html('');
		var parents = result.closest("div.form-group, .winlet-input-group");
		if (parents.length > 0)
			$(parents[0]).removeClass("has-error").removeClass("has-success");
	});
};

WinletJSEngine.form.validateClear = function() {
	for (var i = 0; i < arguments.length; i++) {
		var result = WinletJSEngine.form.getInputResult(arguments[i]);
		if (result != null) {
			result.html('');
			var parents = result.closest("div.form-group, .winlet-input-group");
			if (parents.length > 0)
				$(parents[0]).removeClass("has-error").removeClass("has-success");
		}
	}
};

WinletJSEngine.form.validateSuccess = function(input) {
	var result = WinletJSEngine.form.getInputResult(input);
	if (result != null) {
		result.html('');
		var parents = result.closest("div.form-group, .winlet-input-group");
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
			var parents = result.closest("div.form-group, .winlet-input-group");
			if (parents.length > 0)
				$(parents[0]).removeClass("has-success").addClass("has-error");
		}
		return true;
	};
}();
