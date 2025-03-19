import lexer, { tokenType } from "./lexer.mjs";

let programStatement = [];
let curToken, peekToken;
let programErrors = [];
const errors = [];

const precedence = {
  LOWEST: 1,
  EQUALS: 2, // ==
  LESSGREATER: 3, // > or <
  SUM: 4, // +
  PRODUCT: 5, // *
  PREFIX: 6, // -X or !X
  CALL: 7, // myFunction(X)
};

const Precedence = new Map([
  [tokenType.EQ, precedence.EQUALS],
  [tokenType.NOT_EQ, precedence.EQUALS],
  [tokenType.LT, precedence.LESSGREATER],
  [tokenType.GT, precedence.LESSGREATER],
  [tokenType.PLUS, precedence.SUM],
  [tokenType.MINUS, precedence.SUM],
  [tokenType.SLASH, precedence.PRODUCT],
  [tokenType.ASTERISK, precedence.PRODUCT],
]);

export function Parser() {
  const getNextToken = lexer(code);

  neinoken();
  nextToken();

  const prefixParseFns = new Map();
  registerPrefix(tokenType.IDENT, parseIdentifier);
  registerPrefix(tokenType.INT, parseIntegerLiteral);
  registerPrefix(tokenType.BANG, parsePrefixExpression);
  registerPrefix(tokenType.MINUS, parsePrefixExpression);

  const infixParseFns = new Map();
  registerInfix(tokenType.PLUS, parseInfixExpression);
  registerInfix(tokenType.MINUS, parseInfixExpression);
  registerInfix(tokenType.SLASH, parseInfixExpression);
  registerInfix(tokenType.ASTERISK, parseInfixExpression);
  registerInfix(tokenType.EQ, parseInfixExpression);
  registerInfix(tokenType.NOT_EQ, parseInfixExpression);
  registerInfix(tokenType.LT, parseInfixExpression);
  registerInfix(tokenType.GT, parseInfixExpression);

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

  function parseIdentifier() {
    return { token: curToken, value: curToken.literal };
  }

  function parseIntegerLiteral() {
    return { token: curToken, value: curToken.literal };
  }

  function parsePrefixExpression() {
    const expression = { token: curToken, operator: curToken.literal };

    nextToken();

    expression.right = parseExpression(PREFIX);

    return expression;
  }

  function parseInfixExpression(left) {
    const expression = { token: curToken, operator: curToken.literal, left };

    const precedence = curPrecedence();
    nextToken();

    expression.right = parseExpression(precedence);

    return expression;
  }

  function noPrefixParseFnError(token) {
    const msg = `no prefix parse function for found ${token}`;
    errors.push(msg);
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
      noPrefixParseFnError(curToken.type);
      return null;
    }

    leftExp = prefix();
    return leftExp;
  }

  return programStatement;
}

function peekPrecedence() {
  const precedence = Precedence.get(peekToken.type);

  if (precedence) {
    return precedence;
  }

  return precedence.LOWEST;
}

function curPrecedence() {
  const curPrecedence = Precedence.get(curToken.type);

  if (curPrecedence) {
    return curPrecedence;
  }

  return precedence.LOWEST;
}
