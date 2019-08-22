const esprima = require("esprima");
const escodegen = require("escodegen");

function guardLoops(ast, initAst, guardAst) {
  let foundLoop = false;

  const addGuards = function(blockAst) {
    if (
      blockAst.type === "WhileStatement" ||
      blockAst.type === "ForStatement" ||
      blockAst.type === "DoWhileStatement"
    ) {
      foundLoop = true;
      blockAst.body.body = [].concat(guardAst.body, blockAst.body.body);
    }
    if (Array.isArray(blockAst.body)) {
      for (var i = 0; i < blockAst.body.length; i++) {
        addGuards(blockAst.body[i]);
      }
    } else if (blockAst.body && blockAst.body.body) {
      for (var i = 0; i < blockAst.body.body.length; i++) {
        addGuards(blockAst.body.body[i]);
      }
    }
  };

  addGuards(ast);

  if (foundLoop) {
    ast.body = [].concat(initAst.body, ast.body);
  }

  return ast;
}

module.exports = function(code, options = {}) {
  const timeout = parseInt(options.timeout, 10) || 1000;
  const timeoutErrorMessage = "Timed out";
  const guardInit = `var ___timeout___ = Date.now();`;
  const guard = `if (Date.now() > ___timeout___ + ${timeout}) {
    throw new Error("${timeoutErrorMessage}");
  }`;

  const ast = esprima.parse(code);
  const guardInitAst = esprima.parse(guardInit);
  const guardAst = esprima.parse(guard);
  const guardedAst = guardLoops(ast, guardInitAst, guardAst);
  const guardedCode = escodegen.generate(guardedAst);

  return guardedCode;
};
