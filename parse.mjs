import lexer, { tokenType } from "./lexer.mjs";

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
  [tokenType.LPAREN, precedence.CALL],
]);

export function Parser(getNextTokens) {
  nextToken();
  nextToken();

  const prefixParseFns = new Map();
  registerPrefix(tokenType.IDENT, parseIdentifier);
  registerPrefix(tokenType.INT, parseIntegerLiteral);
  registerPrefix(tokenType.BANG, parsePrefixExpression);
  registerPrefix(tokenType.MINUS, parsePrefixExpression);
  registerPrefix(tokenType.TRUE, parseBoolean);
  registerPrefix(tokenType.FALSE, parseBoolean);
  registerPrefix(tokenType.LPAREN, parseGroupedExpression);
  registerPrefix(tokenType.IF, parseIfExpression);
  registerPrefix(tokenType.FUNCTION, parseFunctionLiteral);

  const infixParseFns = new Map();
  registerInfix(tokenType.PLUS, parseInfixExpression);
  registerInfix(tokenType.MINUS, parseInfixExpression);
  registerInfix(tokenType.SLASH, parseInfixExpression);
  registerInfix(tokenType.ASTERISK, parseInfixExpression);
  registerInfix(tokenType.EQ, parseInfixExpression);
  registerInfix(tokenType.NOT_EQ, parseInfixExpression);
  registerInfix(tokenType.LT, parseInfixExpression);
  registerInfix(tokenType.GT, parseInfixExpression);
  registerInfix(tokenType.LPAREN, parseCallExpression);

  function registerPrefix(tokenType, fn) {
    prefixParseFns.set(tokenType, fn);
  }

  function registerInfix(tokenType, fn) {
    infixParseFns.set(tokenType, fn);
  }

  function nextToken() {
    curToken = peekToken;
    peekToken = getNextTokens();
  }

  function parseProgram() {
    const statements = [];

    while (curToken.type != tokenType.EOF) {
      let stmt = parseStatement();

      if (stmt != null) {
        statements.push(stmt);
      }

      nextToken();
    }

    return { type: "Program", body: statements };
  }

  function parseIdentifier() {
    return { type: "Identifier", value: curToken.literal };
  }

  function parseIntegerLiteral() {
    return { type: "IntegerLiteral", value: curToken.literal };
  }

  function parsePrefixExpression() {
    const expression = { type: "PrefixExpression", operator: curToken.literal };

    nextToken();

    expression.right = parseExpression(PREFIX);

    return expression;
  }

  function parseInfixExpression(left) {
    const expression = {
      type: "InfixExpression",
      operator: curToken.literal,
      left,
    };

    const precedence = curPrecedence();
    nextToken();

    expression.right = parseExpression(precedence);

    return expression;
  }

  function noPrefixParseFnError(token) {
    const msg = `no prefix parse function for found ${token}`;
    errors.push(msg);
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
    let stmt = { type: "Let" };

    if (!expectPeek(tokenType.IDENT)) {
      return null;
    }

    stmt.name = curToken.literal;

    if (!expectPeek(tokenType.ASSIGN)) {
      return null;
    }

    nextToken();

    stmt.value = parseExpression(precedence.LOWEST);

    if (peekTokenIs(tokenType.SEMICOLON)) {
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
    const stmt = { token: curToken };

    nextToken();

    stmt.returnValue = parseExpression(LOWEST);

    while (!curTokenIs(tokenType.SEMICOLON)) {
      nextToken();
    }

    return stmt;
  }

  function parseExpressionStatement() {
    const stmt = { token: curToken };
    stmt.expression = parseExpression(precedence.LOWEST);

    if (peekTokenIs(tokenType.SEMICOLON)) {
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

    const leftExp = prefix();

    while (!peekTokenIs(tokenType.SEMICOLON) && precedence < peekPrecedence()) {
      const infix = infixParseFns.get(peekToken.type);

      if (!infix) {
        return leftExp;
      }

      nextToken();
      leftExp = infix(leftExp);
    }
    return leftExp;
  }

  function parseBoolean() {
    return { type: "Boolean", value: curTokenIs(tokenType.TRUE) };
  }

  function parseGroupedExpression() {
    nextToken();

    const exp = parseExpression(LOWEST);

    if (!expectPeek(tokenType.RPAREN)) {
      return null;
    }

    return exp;
  }

  function parseIfExpression() {
    const expression = { type: "If" };

    if (!expectPeek(tokenType.LPAREN)) {
      return null;
    }

    nextToken();
    expression.condition = parseExpression(LOWEST);

    if (!expectPeek(tokenType.LBRACE)) {
      return null;
    }

    expression.consequence = parseBlockStatement();

    if (peekTokenIs(tokenType.ELSE)) {
      nextToken();

      if (!expectPeek(tokenType.LBRACE)) {
        return null;
      }

      expression.alternative = parseBlockStatement();
    }

    return expression;
  }

  function parseBlockStatement() {
    const block = { token: curToken };
    block.statements = [];

    nextToken();

    while (!curTokenIs(tokenType.RBRACE) && !curTokenIs(tokenType.EOF)) {
      const stms = parseStatement();

      if (stms != null) {
        block.statements.push(stms);
      }

      nextToken();
    }

    return block;
  }

  function parseFunctionLiteral() {
    const lit = { type: "Function" };

    if (!expectPeek(tokenType.LPAREN)) {
      return null;
    }

    lit.parameters = parseFunctionParameters();

    if (!expectPeek(tokenType.LBRACE)) {
      return null;
    }

    lit.body = parseBlockStatement();

    return lit;
  }

  function parseFunctionParameters() {
    const identifiers = [];

    if (peekTokenIs(token.RPAREN)) {
      nextToken();
      return identifiers;
    }

    nextToken();
    const ident = { token: curToken, value: curToken.literal };
    identifiers.push(ident);

    while (peekToken(tokenType.COMMA)) {
      nextToken();
      nextToken();
      ident = { token: curToken, value: curToken.literal };
      identifiers.push(ident);
    }

    if (expectPeek(tokenType.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  function parseCallExpression(fn) {
    const exp = { type: "CallExpression", function: fn };

    exp.arguments = parseCallArguments();

    return exp;
  }

  function parseCallArguments() {
    const args = [];

    if (peekTokenIs(tokenType.RPAREN)) {
      nextToken();
      return args;
    }

    nextToken();
    args.push(parseExpression(LOWEST));

    while (peekTokenIs(tokenType.COMMA)) {
      nextToken();
      nextToken();
      args.push(parseExpression(LOWEST));
    }

    if (expectPeek(tokenType.RPAREN)) {
      return null;
    }

    return args;
  }

  return { parseProgram, errors };
}

function peekPrecedence() {
  const tokenPrecedence = Precedence.get(peekToken.type);

  if (tokenPrecedence) {
    return tokenPrecedence;
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
