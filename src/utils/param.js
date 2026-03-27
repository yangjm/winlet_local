/**
 * Serialize object to URL parameter string.
 * Replaces jQuery's $.param(obj, traditional)
 */
export function param(obj, traditional) {
	var parts = [];

	for (var key in obj) {
		if (!obj.hasOwnProperty(key)) continue;
		var val = obj[key];
		if (val == null) continue;

		if (Array.isArray(val)) {
			for (var i = 0; i < val.length; i++) {
				if (traditional) {
					parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(val[i]));
				} else {
					parts.push(encodeURIComponent(key + "[]") + "=" + encodeURIComponent(val[i]));
				}
			}
		} else if (typeof val === "object") {
			for (var subKey in val) {
				if (val.hasOwnProperty(subKey)) {
					parts.push(encodeURIComponent(key + "[" + subKey + "]") + "=" + encodeURIComponent(val[subKey]));
				}
			}
		} else {
			parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
		}
	}

	return parts.join("&");
}
