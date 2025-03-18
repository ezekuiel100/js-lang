import lexer, { tokenType } from "./lexer.mjs";

let programStatement = [];
let curToken, peekToken;
let programErrors = [];

export function Parser() {
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
    case tokenType.RETURN:
      return parseReturnStatement();
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

function peekTokenIs(tokenType) {
  return peekToken.type === tokenType;
}

function expectPeek(tokenType) {
  if (peekTokenIs(tokenType)) {
    nextToken();
    return true;
  } else {
    peekError(tokenType);
    return false;
  }
}

function peekError(tokenType) {
  const msg = `expected next token to be ${tokenType}, got instead ${peekToken.Type}`;

  console.log(msg);

  programErrors.push(msg);
}

function parseReturnStatement() {
  stmt = { token: curToken };

  nextToken();

  while (!curTokenIs(tokenType.SEMICOLON)) {
    nextToken();
  }

  return stmt;
}

function parseExpressionStatement() {
  stmt = { token: curToken };
  stmt.expression = parseExpression(LOWEST);

  if (peekToken(tokenType.SEMICOLON)) {
    nextToken();
  }

  return stmt;
}
