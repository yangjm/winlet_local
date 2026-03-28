import { WinletJSEngine } from './core.js';

WinletJSEngine.canUseSessionStorage = function() {
	if (WinletJSEngine.useSessionStorage == null) {
		WinletJSEngine.useSessionStorage = false;
		if (typeof(sessionStorage) !== "undefined") {
			try {
				sessionStorage.setItem("winlet_test", 1);
				sessionStorage.removeItem("winlet_test");
				WinletJSEngine.useSessionStorage = true;
			} catch {}
		}
	}
	return WinletJSEngine.useSessionStorage;
};

WinletJSEngine.setSessionId = function(id) {
	if (WinletJSEngine.winletDomain) {
		if (WinletJSEngine.canUseSessionStorage()) {
			sessionStorage.setItem('winlet_session_id', id);
		} else {
			document.cookie = "WINLET_SESSION_ID=" + id;
		}
	}
};

WinletJSEngine.getSessionId = function() {
	if (WinletJSEngine.winletDomain) {
		if (WinletJSEngine.canUseSessionStorage()) {
			return sessionStorage.getItem('winlet_session_id');
		} else {
			return decodeURIComponent(document.cookie.replace(
				new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent("WINLET_SESSION_ID")
					.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		}
	}
	return null;
};
