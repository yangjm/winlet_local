function uaMatch(ua) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
	var platform_match = /(ipad)/.exec(ua) || /(iphone)/.exec(ua) || /(android)/.exec(ua) || [];

	return {
		browser: match[1] || "",
		version: match[2] || "0",
		platform: platform_match[0] || ""
	};
}

var matched = uaMatch(window.navigator.userAgent);
var browser = {};

if (matched.browser) {
	browser[matched.browser] = true;
	browser.version = matched.version;
}

if (matched.platform) {
	browser[matched.platform] = true;
}

if (browser.chrome) {
	browser.webkit = true;
} else if (browser.webkit) {
	browser.safari = true;
}

export { browser };
