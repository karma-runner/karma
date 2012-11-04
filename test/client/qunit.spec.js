/**
 Tests for adapter/qunit.src.js
 These tests are executed in browser.
 */

test("should report failed result", function () {
    ok(2 !== 2, "Passed!");
});

test("should report success result", function () {
  ok( 1 == "1", "Passed!" );
});

test("another success result", function () {
    ok(2 === 2, "Passed!");
});

test("should report multiple success results", function () {
    ok(1 === 1, "Passed!");
    ok(2 === 2, "Passed!");
    ok(3 === 3, "Passed!");
});

test("should report one failed result", function () {
    ok(1 === 1, "Passed!");
    ok(2 === 5, "Passed!");
    ok(3 === 3, "Passed!");
});

asyncTest("asynchronous test: one second later!", function () {
    expect(1);
    setTimeout(function () {
        ok(true, "Passed and ready to resume!"); start();
    }, 1000);
});

module("group a");

test("should report success result within group a", function () {
    ok(2 === 2, "Passed!");
});

test("should report another success result within group a", function () {
    ok(1 == "1", "Passed!");
});

module("group b");

test("should report failed result within group b", function () {
    ok(2 !== 2, "Passed!");
});

test("should report sucess result within group b", function () {
    ok(1 == "1", "Passed!");
});
