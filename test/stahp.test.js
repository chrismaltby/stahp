const stahp = require("../index");
const esprima = require("esprima");
const escodegen = require("escodegen");

const format = function(code) {
  // Format expected output to match indentation returned by escodegen
  return escodegen.generate(esprima.parse(code));
};

test("Should not edit single expression", () => {
  const inCode = `var a = 42;`;
  expect(stahp(inCode)).toBe(format(inCode));
});

test("Should guard while loops", () => {
  const inCode = `while (true) {}`;
  const outCode = `var ___timeout___ = Date.now();
    while (true) {
      if (Date.now() > ___timeout___ + 1000) {
        throw new Error('Timed out');
      }
    }`;
  expect(stahp(inCode)).toBe(format(outCode));
});

test("Should guard for loops", () => {
  const inCode = `for (var i=0;i<100;i--) {}`;
  const outCode = `var ___timeout___ = Date.now();
    for (var i=0;i<100;i--) {
      if (Date.now() > ___timeout___ + 1000) {
        throw new Error('Timed out');
      }
    }`;
  expect(stahp(inCode)).toBe(format(outCode));
});

test("Should guard do while loops", () => {
  const inCode = `do {} while (true)`;
  const outCode = `var ___timeout___ = Date.now();
    do {
      if (Date.now() > ___timeout___ + 1000) {
        throw new Error('Timed out');
      }
    } while (true)`;
  expect(stahp(inCode)).toBe(format(outCode));
});

test("Should not guard for in loops", () => {
  const inCode = `var arr = [1,2,3]; for (var i in arr) {}`;
  expect(stahp(inCode)).toBe(format(inCode));
});

test("Should not guard for of loops", () => {
  const inCode = `var arr = [1,2,3]; for (var i of arr) {}`;
  expect(stahp(inCode)).toBe(format(inCode));
});

test("Should guard nested loops", () => {
  const inCode = `while(true) {
      for(var i=0;i<5;i++) {}
    }`;
  const outCode = `var ___timeout___ = Date.now();
    while (true) {
      if (Date.now() > ___timeout___ + 1000) {
        throw new Error('Timed out');
      }
      for(var i=0;i<5;i++) {
        if (Date.now() > ___timeout___ + 1000) {
          throw new Error('Timed out');
        }
      }
    }`;
  expect(stahp(inCode)).toBe(format(outCode));
});

test("Should allow changing timeout", () => {
  const inCode = `while (true) {}`;
  const outCode = `var ___timeout___ = Date.now();
    while (true) {
      if (Date.now() > ___timeout___ + 123) {
        throw new Error('Timed out');
      }
    }`;
  const options = { timeout: 123 };
  expect(stahp(inCode, options)).toBe(format(outCode));
});
