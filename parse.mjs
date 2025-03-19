import lexer, { tokenType } from "./lexer.mjs";

let programStatement = [];
let curToken, peekToken;
let programErrors = [];

const Precedence = {
  LOWEST: 1,
  EQUALS: 2, // ==
  LESSGREATER: 3, // > or <
  SUM: 4, // +
  PRODUCT: 5, // *
  PREFIX: 6, // -X or !X
  CALL: 7, // myFunction(X)
};

export function Parser() {
  const getNextToken = lexer(code);

  neinoken();
  nextToken();

  const prefixParseFns = new Map();
  const infixParseFns = new Map();

  function registerPrefix(tokenType, fn) {
    prefixParseFns.set(tokenType, fn);
  }

  function registerInfix(tokenType, fn) {
    infixParseFns.set(tokenType, fn);
  }

  function nextToken() {
    curToken = peekToken;
    peekToken = getNextToken();
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

  function parseStatement() {
    switch (curToken.type) {
      case tokenType.LET:
        return parseLetStatement();
      case tokenType.RETURN:
        return parseReturnStatement();
      default:
        return parseExpressionStatement();
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

  function parseExpression(precedence) {
    const prefix = prefixParseFns.get(curToken.type);

    if (!prefix) {
      return null;
    }

    leftExp = prefix();
    return leftExp;
  }

  return programStatement;
}
