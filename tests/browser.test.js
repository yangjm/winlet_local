/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";

/**
 * browser.js reads navigator.userAgent at module load time,
 * so we must set up the UA before each dynamic import.
 */

async function loadBrowserWithUA(ua) {
	vi.stubGlobal("navigator", { userAgent: ua });
	// Force fresh module evaluation each time
	const mod = await import("../src/utils/browser.js?ua=" + encodeURIComponent(ua));
	return mod.browser;
}

describe("browser detection", () => {
	it("detects Chrome", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
		);
		expect(b.chrome).toBe(true);
		expect(b.webkit).toBe(true);
		expect(b.version).toBe("120.0.0.0");
	});

	it("detects Safari (webkit without chrome)", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
		);
		expect(b.webkit).toBe(true);
		expect(b.safari).toBe(true);
	});

	it("detects Firefox (mozilla)", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
		);
		expect(b.mozilla).toBe(true);
		expect(b.version).toBe("121.0");
	});

	it("detects IE (msie)", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)"
		);
		expect(b.msie).toBe(true);
		expect(b.version).toBe("10.0");
	});

	it("detects iPad platform", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
		);
		expect(b.ipad).toBe(true);
	});

	it("detects Android platform", async () => {
		var b = await loadBrowserWithUA(
			"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
		);
		expect(b.android).toBe(true);
	});
});
