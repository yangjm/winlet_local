import { WinletJSEngine, ElmRect } from './core.js';

WinletJSEngine.clearLoading = function(container) {
	try {
		if (container.loading) {
			container.loading.remove();
			container.loading = null;
		}
	} catch {}
};

WinletJSEngine.showLoading = function(container, dialog, nodelay) {
	try {
		WinletJSEngine.clearLoading(container);

		var rect = new ElmRect(container);
		try {
			if (dialog != null)
				rect = new ElmRect(dialog);
		} catch {}

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
	} catch {}
};
