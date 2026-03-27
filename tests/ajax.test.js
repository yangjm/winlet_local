/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ajax } from "../src/utils/ajax.js";

function mockFetch(body, options) {
	var status = (options && options.status) || 200;
	var headers = new Headers(options && options.headers || {});
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status: status,
		statusText: status === 200 ? "OK" : "Error",
		headers: headers,
		text: function() { return Promise.resolve(body); },
	});
}

describe("ajax", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", mockFetch("response text"));
		// Provide location for cross-origin checks
		vi.stubGlobal("location", { protocol: "http:", host: "localhost" });
	});

	it("makes a POST request by default", async () => {
		await ajax({ url: "/api" });
		expect(fetch).toHaveBeenCalledWith("/api", expect.objectContaining({ method: "POST" }));
	});

	it("makes a GET request when type=GET", async () => {
		await ajax({ url: "/api", type: "GET" });
		expect(fetch).toHaveBeenCalledWith("/api", expect.objectContaining({ method: "GET" }));
	});

	it("sets Content-Type for string body", async () => {
		await ajax({ url: "/api", data: "a=1&b=2" });
		var callArgs = fetch.mock.calls[0][1];
		expect(callArgs.headers["Content-Type"]).toContain("application/x-www-form-urlencoded");
	});

	it("does not set Content-Type for non-string body", async () => {
		await ajax({ url: "/api", data: undefined });
		var callArgs = fetch.mock.calls[0][1];
		expect(callArgs.headers["Content-Type"]).toBeUndefined();
	});

	it("calls success callback with data on 200", async () => {
		vi.stubGlobal("fetch", mockFetch("ok"));
		var result;
		await ajax({
			url: "/api",
			success: function(data) { result = data; },
		});
		expect(result).toBe("ok");
	});

	it("calls success with parsed JSON when dataType=json", async () => {
		vi.stubGlobal("fetch", mockFetch('{"key":"val"}'));
		var result;
		await ajax({
			url: "/api",
			dataType: "json",
			success: function(data) { result = data; },
		});
		expect(result).toEqual({ key: "val" });
	});

	it("falls back to text when JSON parse fails", async () => {
		vi.stubGlobal("fetch", mockFetch("not json"));
		var result;
		await ajax({
			url: "/api",
			dataType: "json",
			success: function(data) { result = data; },
		});
		expect(result).toBe("not json");
	});

	it("calls error callback on non-OK response", async () => {
		vi.stubGlobal("fetch", mockFetch("fail", { status: 500 }));
		var errStatus;
		await ajax({
			url: "/api",
			error: function(jqXHR, status) { errStatus = status; },
		});
		expect(errStatus).toBe("error");
	});

	it("calls error callback on network failure", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
		var errMsg;
		await ajax({
			url: "/api",
			error: function(jqXHR, status, err) { errMsg = err; },
		});
		expect(errMsg).toBe("network down");
	});

	it("success callback receives jqXHR with getResponseHeader", async () => {
		vi.stubGlobal("fetch", mockFetch("ok", { headers: { "X-Custom": "test" } }));
		var headerVal;
		await ajax({
			url: "/api",
			success: function(data, status, jqXHR) {
				headerVal = jqXHR.getResponseHeader("X-Custom");
			},
		});
		expect(headerVal).toBe("test");
	});

	it("uses same-origin credentials for relative URLs", async () => {
		await ajax({ url: "/api" });
		var callArgs = fetch.mock.calls[0][1];
		expect(callArgs.credentials).toBe("same-origin");
	});

	it("uses include credentials for cross-origin URLs", async () => {
		await ajax({ url: "https://other.com/api" });
		var callArgs = fetch.mock.calls[0][1];
		expect(callArgs.credentials).toBe("include");
	});

	it("uses same-origin credentials for same-origin absolute URLs", async () => {
		await ajax({ url: "http://localhost/api" });
		var callArgs = fetch.mock.calls[0][1];
		expect(callArgs.credentials).toBe("same-origin");
	});
});
