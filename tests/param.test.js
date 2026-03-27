import { describe, it, expect } from "vitest";
import { param } from "../src/utils/param.js";

describe("param", () => {
	it("serializes simple key-value pairs", () => {
		expect(param({ a: "1", b: "2" })).toBe("a=1&b=2");
	});

	it("returns empty string for empty object", () => {
		expect(param({})).toBe("");
	});

	it("skips null and undefined values", () => {
		expect(param({ a: "1", b: null, c: undefined })).toBe("a=1");
	});

	it("encodes special characters", () => {
		expect(param({ q: "hello world" })).toBe("q=hello%20world");
		expect(param({ url: "a=1&b=2" })).toBe("url=a%3D1%26b%3D2");
	});

	it("serializes nested objects with bracket notation", () => {
		expect(param({ user: { name: "John", age: "30" } }))
			.toBe("user%5Bname%5D=John&user%5Bage%5D=30");
	});

	it("serializes arrays with bracket notation (traditional=false)", () => {
		expect(param({ colors: ["red", "blue"] }))
			.toBe("colors%5B%5D=red&colors%5B%5D=blue");
	});

	it("serializes arrays without brackets (traditional=true)", () => {
		expect(param({ colors: ["red", "blue"] }, true))
			.toBe("colors=red&colors=blue");
	});

	it("handles mixed types", () => {
		var result = param({ name: "test", tags: ["a", "b"], meta: { k: "v" } });
		expect(result).toContain("name=test");
		expect(result).toContain("tags%5B%5D=a");
		expect(result).toContain("tags%5B%5D=b");
		expect(result).toContain("meta%5Bk%5D=v");
	});
});
