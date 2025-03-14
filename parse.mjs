import lexer, { tokenType } from "./lexer.mjs";

let programStatement = [];
let curToken, peekToken;

function newParser() {
  const p = lexer(code);

  p.nextToken();
  p.nextToken();

  function nextToken() {
    curToken = peekToken;
    peekToken = p.nextToken();
  }

  function parseProgram() {
    while (curToken.type != tokenType.EOF) {
      let stmt = parseStatement();

      if (stmt != null) {
        programStatement.push(stmt);
      }
    }

    p.nextToken();
  }

  return programStatement;
}

function parseStatement() {
  switch (curToken.type) {
    case tokenType.LET:
      return parseLetStatement();
    default:
      return null;
  }
}

function parseLetStatement() {
  let stmt = { token: curToken };

  if (!expectPeek(tokenType.IDENT)) {
    return null;
  }

  stmt.name = { token: curToken, value: curToken.literal };

  if (!expectPeek(tokenType.ASSIGN)) {
    return null;
  }

  while (!curTokenIs(tokenType.SEMICOLON)) {
    p.nextToken();
  }

  return stmt;
}
