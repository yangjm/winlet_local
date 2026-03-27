import { describe, it, expect } from "vitest";
import { deparam } from "../src/utils/deparam.js";
import { param } from "../src/utils/param.js";

describe("deparam", () => {
	it("parses simple key-value pairs", () => {
		expect(deparam("a=1&b=2")).toEqual({ a: "1", b: "2" });
	});

	it("returns empty object for empty string", () => {
		expect(deparam("")).toEqual({});
	});

	it("returns empty object for non-string input", () => {
		expect(deparam(null)).toEqual({});
		expect(deparam(undefined)).toEqual({});
	});

	it("decodes plus signs as spaces", () => {
		expect(deparam("q=hello+world")).toEqual({ q: "hello world" });
	});

	it("decodes percent-encoded values", () => {
		expect(deparam("q=hello%20world")).toEqual({ q: "hello world" });
	});

	describe("coerce=true", () => {
		it("coerces numbers", () => {
			expect(deparam("n=42", true)).toEqual({ n: 42 });
			expect(deparam("f=3.14", true)).toEqual({ f: 3.14 });
		});

		it("coerces booleans", () => {
			expect(deparam("a=true&b=false", true)).toEqual({ a: true, b: false });
		});

		it("coerces null", () => {
			expect(deparam("x=null", true)).toEqual({ x: null });
		});

		it("coerces undefined", () => {
			expect(deparam("x=undefined", true)).toEqual({ x: undefined });
		});
	});

	describe("coerce=false", () => {
		it("keeps everything as strings", () => {
			expect(deparam("n=42")).toEqual({ n: "42" });
			expect(deparam("b=true")).toEqual({ b: "true" });
		});
	});

	it("parses bracket array notation colors[]=red&colors[]=blue", () => {
		var result = deparam("colors[]=red&colors[]=blue");
		expect(result.colors).toEqual(["red", "blue"]);
	});

	it("parses nested bracket notation user[name]=John", () => {
		var result = deparam("user[name]=John");
		expect(result.user).toEqual({ name: "John" });
	});

	it("handles duplicate keys by creating arrays", () => {
		var result = deparam("tag=a&tag=b");
		expect(result.tag).toEqual(["a", "b"]);
	});

	it("handles key without value", () => {
		var result = deparam("flag");
		expect(result.flag).toBe("");
	});

	it("handles key without value with coerce", () => {
		var result = deparam("flag", true);
		expect(result.flag).toBe(undefined);
	});

	describe("roundtrip with param", () => {
		it("simple object survives roundtrip", () => {
			var obj = { a: "1", b: "hello" };
			expect(deparam(param(obj))).toEqual(obj);
		});
	});
});
