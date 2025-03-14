import lexer, { tokenType } from "./lexer.mjs";

let programStatement = [];
let curToken, peekToken;

function newParser() {
  const lexer = lexer(code);

  nextToken();
  nextToken();

  function nextToken() {
    curToken = peekToken;
    peekToken = lexer.nextToken();
  }

  function parseProgram() {
    while (curToken.type != tokenType.EOF) {
      let stmt = parseStatement();

      if (stmt != null) {
        programStatement.push(stmt);
      }
    }

    nextToken();
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
    nextToken();
  }

  return stmt;
}

function curTokenIs(tokenType) {
  return curToken.type === tokenType;
}

function peekToken(tokenType) {
  return peekToken.type === tokenType;
}
