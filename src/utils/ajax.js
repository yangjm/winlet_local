/**
 * Fetch-based AJAX wrapper replacing jQuery's $.ajax
 *
 * Supports: { type, url, data, success, error, dataType }
 * The jqXHR shim in success/error callbacks supports .getResponseHeader(name)
 */
export function ajax(options) {
	var body = options.data;
	var headers = {};

	if (typeof body === "string") {
		headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
	}

	var fetchOptions = {
		method: options.type || "POST",
		headers: headers,
		body: body,
	};

	// For cross-domain requests, include credentials
	if (options.url && options.url.indexOf("//") >= 0) {
		var pageOrigin = window.location.protocol + "//" + window.location.host;
		if (options.url.indexOf(pageOrigin) !== 0) {
			fetchOptions.credentials = "include";
		} else {
			fetchOptions.credentials = "same-origin";
		}
	} else {
		fetchOptions.credentials = "same-origin";
	}

	return fetch(options.url, fetchOptions)
		.then(function(response) {
			var jqXHR = {
				getResponseHeader: function(name) {
					return response.headers.get(name);
				}
			};

			var parseResponse;
			if (options.dataType === "json") {
				parseResponse = response.text().then(function(text) {
					try { return JSON.parse(text); } catch(e) { return text; }
				});
			} else {
				parseResponse = response.text();
			}

			return parseResponse.then(function(data) {
				if (response.ok) {
					if (options.success) {
						options.success(data, "success", jqXHR);
					}
				} else {
					if (options.error) {
						options.error(jqXHR, "error", response.statusText);
					}
				}
			});
		})
		.catch(function(err) {
			if (options.error) {
				options.error({}, "error", err.message);
			}
		});
}
