(function($) {
	win$.engine.getDialog = function($container, createIfNotExist) {
		var $winlet = win$.engine.traceToWinlet($container);
		if ($winlet == null || $winlet.length != 1)
			return null;

		if ($winlet[0].dlg == null) {
			if (!createIfNotExist)
				return null;

			$winlet[0].dlg = $('<div class="modal fade" data-winlet-dialog="yes" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">&nbsp;</h4></div><div class="modal-body">Body</div><div class="modal-footer">&nbsp;</div></div></div></div>');
			var wrap = $('<div class="winlet-bootstrap"></div>');
			wrap.append($winlet[0].dlg);
			$(document.body).append(wrap);
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
	win$.engine.closeDialog = function($container) {
		var d = $.Deferred();

		var dlg = win$.engine.getDialog($container, false);
		if (dlg == null) {
			d.resolve();
			return d;
		}

		try {
			if (dlg.hasClass('in')) // http://stackoverflow.com/questions/19674701/can-i-check-if-bootstrap-modal-shown-hidden
				dlg.off('hidden.bs.modal').on('hidden.bs.modal', function() {
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

	win$.engine.openDialog = function($container, content, title) {
		var dlg = win$.engine.getDialog($container, true);

		var body = dlg.find("div.modal-body");
		var html = $.trim(win$.engine.procStyle(win$.engine.procWinFunc(
			content.replace(win$.engine.reScriptAll, '')
			.replace(win$.engine.reDialogSetting, ''), $container)));

		if (html == '') {
			win$.engine.closeDialog($container);
			return;
		}

		// 在对话框中添加一个容器窗口，如果对话框中包含子窗口的话，子窗口可以根据DOM关系寻找到这个容器窗口，然后
		// 沿着容器窗口的data-wnlet-src-id找到触发对话框的窗口，这样子窗口中执行post()等方法时可以获得完整
		// 的容器参数。对话框中的form也可以根据DOM关系找到容器窗口，然后找到触发对话框的窗口
		body.empty().append('<div data-winlet-src-id="' + $container.data("winlet-id") + '">' + html + '<div>');

		var settings = win$.engine.reDialogSetting.exec(content);
		if (settings != null) {
			settings = JSON.parse(win$.engine.procWinFunc(settings[1], $container));
			dlg.find("h4.modal-title").empty().append(settings.title);

			if (settings.class && settings.class != '')
				dlg.find('.modal-dialog').addClass(settings.class);

			if (settings.width && settings.width != '')
				dlg.find('.modal-dialog').css("width", settings.width);
			else if (settings.maxwidth && settings.maxwidth != '') {
				try {
					var maxwidth = parseInt(settings.maxwidth);
					var padding = 0;
					var width = win$.engine.getViewport().width;

					if (settings.padding && settings.padding != '')
						padding = parseInt(settings.padding);
					if (width > maxwidth + padding * 2)
						dlg.find('.modal-dialog').css("width", Math.round(maxwidth / width * 100) + "%");
					else
						dlg.find('.modal-dialog').css("width", "");
				} catch (e) {
					console.log(e);
				}
			} else
				dlg.find('.modal-dialog').css("width", "");

			if (settings.buttons) {
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
			} else {
				dlg.find("div.modal-footer").remove();
			}
		} else if (title != null) {
			dlg.find("h4.modal-title").empty().append(title);
		}

		$(function() {
			var focus = null;

			// !!!!!! 修改以下逻辑时请注意与winlet_local中的enableForm一致 !!!!!!
			body.find("form").filter(function() {
				var attrs = this.attributes;
				for (var i = 0; i < attrs.length; i++) {
					if (attrs[i].name.indexOf("data-winlet-") == 0)
						return true;
				}
				return false;
			}).each(function() {
				var form = $(this);
				// 对话框中的form如果是在对话框内容里的子窗口中，则$containing不为空。
				var $containing = win$.engine.getContainer(form);

				// form使用settings里的container来找到所属的container，而不是直接在DOM中寻找，因为在对话框中的form通过DOM不一定能找到所属的container
				var settings = {
					winFocus: true, // 提交完毕是否滚动所属窗口
					focus: form.attr("data-winlet-focus"),
					update: form.attr("data-winlet-update"),
					validate: form.attr("data-winlet-validate"),
					hideloading: form.attr("data-winlet-hideloading"),
					container: $containing == null ? $container : $containing,
					dialog: dlg
				};

				if ("true" == form.attr("data-winlet-win-nofocus"))
					settings.winFocus = false;
				if (settings.validate == null || settings.validate == "")
					settings.validate = "form";

				form.winform(settings);

				if (form.attr("data-winlet-focus"))
					focus = form.find('input[name="' + form.attr("data-winlet-focus") + '"], textarea[name="' + form.attr("data-winlet-focus") + '"]');
			});

			var dfd = $.Deferred();

			// 对话框显示后再执行其中的脚本
			dfd.promise().done(function() {
				if (focus) {
					focus.select();
					focus.focus();
				}
				win$.engine.procScript(content, $container);
				win$.engine.invokeAfterLoad(body);
			});

			if ((dlg.data('bs.modal') || {}).isShown) // 对话框已经显示
				dfd.resolve();
			else { // 未显示
				dlg.off('shown.bs.modal').on('shown.bs.modal', function() {
					dlg.off('shown.bs.modal');
					dfd.resolve();
				});

				dlg.modal('show');
			}
		});
	};


	win$.engine.form.validateClearAll = function(form) {
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

	win$.engine.form.validateClear = function() {
		for (var i = 0; i < arguments.length; i++) {
			var result = win$.engine.form.getInputResult(arguments[i]);
			if (result != null) {
				result.html('');
				var parents = result.closest("div.form-group, .winlet-input-group");
				if (parents.length > 0)
					$(parents[0]).removeClass("has-error").removeClass("has-success");
			}
		}
	};

	win$.engine.form.validateSuccess = function(input) {
		var result = win$.engine.form.getInputResult(input);
		if (result != null) {
			result.html('');
			var parents = result.closest("div.form-group, .winlet-input-group");
			if (parents.length > 0)
				$(parents[0]).removeClass("has-error").addClass("has-success");
		}
	};

	win$.engine.form.validateError = function() {
		var original = win$.engine.form.validateError;
		return function(input, msg) {
			original(input, msg);

			var result = win$.engine.form.getInputResult(input);
			if (result != null) {
				var parents = result.closest("div.form-group, .winlet-input-group");
				if (parents.length > 0)
					$(parents[0]).removeClass("has-success").addClass("has-error");
			}
			return true;
		};
	}();
})(win$.jQuery);