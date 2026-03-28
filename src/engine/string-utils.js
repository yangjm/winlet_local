import { WinletJSEngine } from './core.js';

WinletJSEngine.parseJson = function(str) {
	if (!str || str.trim() == '') return {};
	return JSON.parse(str);
};

WinletJSEngine.startsWith = function(str, w) {
	return str != null && typeof str == 'string' && w && str.slice(0, w.length) == w;
};

WinletJSEngine.endsWith = function(str, w) {
	return str != null && typeof str == 'string' && w && str.slice(-w.length) == w;
};

WinletJSEngine._utf8_decode = function(utftext) {
	if (utftext == null) return null;
	utftext = unescape(utftext);
	var string = "";
	var i = 0;
	var c, c2, c3;
	c = c2 = 0;

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
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		}
	}
	return string;
};
