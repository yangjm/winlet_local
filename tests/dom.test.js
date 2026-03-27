/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { qs, qsa, offset, serializeForm, createElement, domReady } from "../src/utils/dom.js";

describe("qs", () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="app"><span class="item">A</span><span class="item">B</span></div>';
	});

	it("finds element by selector", () => {
		var el = qs("#app");
		expect(el).not.toBeNull();
		expect(el.id).toBe("app");
	});

	it("returns null for non-existent selector", () => {
		expect(qs("#missing")).toBeNull();
	});

	it("accepts parent parameter", () => {
		var app = qs("#app");
		var span = qs(".item", app);
		expect(span.textContent).toBe("A");
	});
});

describe("qsa", () => {
	beforeEach(() => {
		document.body.innerHTML = '<ul><li>1</li><li>2</li><li>3</li></ul>';
	});

	it("returns real array of elements", () => {
		var items = qsa("li");
		expect(Array.isArray(items)).toBe(true);
		expect(items).toHaveLength(3);
	});

	it("returns empty array for no matches", () => {
		expect(qsa(".nothing")).toEqual([]);
	});

	it("accepts parent parameter", () => {
		var ul = qs("ul");
		var items = qsa("li", ul);
		expect(items).toHaveLength(3);
	});
});

describe("offset", () => {
	it("returns object with top and left", () => {
		document.body.innerHTML = '<div id="box"></div>';
		var el = qs("#box");
		var result = offset(el);
		expect(result).toHaveProperty("top");
		expect(result).toHaveProperty("left");
		expect(typeof result.top).toBe("number");
		expect(typeof result.left).toBe("number");
	});
});

describe("serializeForm", () => {
	it("serializes form fields to URL-encoded string", () => {
		document.body.innerHTML = '<form><input name="user" value="john"><input name="age" value="30"></form>';
		var form = qs("form");
		var result = serializeForm(form);
		expect(result).toContain("user=john");
		expect(result).toContain("age=30");
	});

	it("handles empty form", () => {
		document.body.innerHTML = "<form></form>";
		var form = qs("form");
		expect(serializeForm(form)).toBe("");
	});
});

describe("createElement", () => {
	it("creates element from HTML string", () => {
		var el = createElement("<div class='test'>hello</div>");
		expect(el.tagName).toBe("DIV");
		expect(el.className).toBe("test");
		expect(el.textContent).toBe("hello");
	});

	it("creates element with leading/trailing whitespace trimmed", () => {
		var el = createElement("  <span>hi</span>  ");
		expect(el.tagName).toBe("SPAN");
	});
});

describe("domReady", () => {
	it("calls callback immediately when document is already loaded", () => {
		var called = false;
		domReady(function() { called = true; });
		expect(called).toBe(true);
	});
});
