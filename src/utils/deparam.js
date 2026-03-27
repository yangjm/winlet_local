/**
 * Deserialize URL parameter string to object.
 * Port of jQuery BBQ's $.deparam (v1.3pre)
 */
export function deparam(str, coerce) {
	var obj = {};
	var coerceTypes = { "true": true, "false": false, "null": null };

	if (!str || typeof str !== "string") return obj;

	var pairs = str.replace(/\+/g, " ").split("&");
	for (var idx = 0; idx < pairs.length; idx++) {
		var pair = pairs[idx];
		var parts = pair.split("=");
		var key = decodeURIComponent(parts[0]);
		var val;
		var cur = obj;
		var i = 0;
		var keys;
		var keysLast;

		if (!key) continue;

		if (parts.length === 2) {
			val = decodeURIComponent(parts[1]);

			if (coerce) {
				val = val && !isNaN(val) ? +val
					: val === "undefined" ? undefined
					: coerceTypes[val] !== undefined ? coerceTypes[val]
					: val;
			}

			// Handle bracket notation: a[b][c]=1
			if (/\[/.test(key)) {
				keys = key.replace(/\]$/, "").split("][");
				keys = keys.shift().split("[").concat(keys);
				keysLast = keys.length - 1;

				for (; i <= keysLast; i++) {
					key = keys[i] === "" ? cur.length : keys[i];
					cur = cur[key] = i < keysLast
						? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
						: val;
				}
			} else {
				if (Array.isArray(obj[key])) {
					obj[key].push(val);
				} else if (obj[key] !== undefined) {
					obj[key] = [obj[key], val];
				} else {
					obj[key] = val;
				}
			}
		} else {
			if (key) {
				obj[key] = coerce ? undefined : "";
			}
		}
	}

	return obj;
}
