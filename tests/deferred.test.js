import { describe, it, expect } from "vitest";
import { Deferred, whenAll } from "../src/utils/deferred.js";

describe("Deferred", () => {
	it("resolve triggers .done() callback", async () => {
		var dfd = Deferred();
		var result;
		dfd.done(function(val) { result = val; });
		dfd.resolve("ok");
		await dfd.promise();
		expect(result).toBe("ok");
	});

	it("reject triggers .fail() on promise", async () => {
		var dfd = Deferred();
		var result;
		dfd.promise().fail(function(val) { result = val; });
		dfd.reject("err");
		try { await dfd.promise(); } catch (e) { /* expected */ }
		expect(result).toBe("err");
	});

	it(".promise() returns a thenable", () => {
		var dfd = Deferred();
		var p = dfd.promise();
		expect(typeof p.then).toBe("function");
	});

	it(".promise() has .done() and .fail() aliases", () => {
		var dfd = Deferred();
		var p = dfd.promise();
		expect(typeof p.done).toBe("function");
		expect(typeof p.fail).toBe("function");
	});

	it("resolve passes value through .then()", async () => {
		var dfd = Deferred();
		dfd.resolve(42);
		var val = await dfd.promise();
		expect(val).toBe(42);
	});

	it(".done() is chainable on deferred", () => {
		var dfd = Deferred();
		var ret = dfd.done(function() {});
		expect(ret).toBe(dfd);
	});

	it(".resolve() is chainable on deferred", () => {
		var dfd = Deferred();
		var ret = dfd.resolve("x");
		expect(ret).toBe(dfd);
	});
});

describe("whenAll", () => {
	it("resolves when all promises resolve", async () => {
		var result = await whenAll([
			Promise.resolve(1),
			Promise.resolve(2),
			Promise.resolve(3),
		]);
		expect(result).toEqual([1, 2, 3]);
	});

	it("rejects when any promise rejects", async () => {
		await expect(
			whenAll([Promise.resolve(1), Promise.reject("fail")])
		).rejects.toBe("fail");
	});

	it("returns promise with .done() alias", () => {
		var p = whenAll([Promise.resolve(1)]);
		expect(typeof p.done).toBe("function");
	});

	it("returns promise with .fail() alias", () => {
		var p = whenAll([Promise.resolve(1)]);
		expect(typeof p.fail).toBe("function");
	});

	it(".done() callback receives array of results", async () => {
		var result;
		var p = whenAll([Promise.resolve("a"), Promise.resolve("b")]);
		p.done(function(val) { result = val; });
		await p;
		expect(result).toEqual(["a", "b"]);
	});
});
