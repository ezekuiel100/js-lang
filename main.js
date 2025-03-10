const ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENT = "INDET",
  INT = "INT",
  ASSIGN = "=",
  PLUS = "+",
  SEMICOLON = ";",
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",
  FUNCTION = "FUNCTION",
  LET = "LET",
  TRUE = "TRUE",
  FALSE = "FALSE",
  IF = "IF",
  ELSE = "ELSE",
  RETURN = "RETURN";

const keyword = new Map([
  ["fn", FUNCTION],
  ["let", LET],
  ["true", TRUE],
  ["false", FALSE],
  ["if", IF],
  ["else", ELSE],
  ["return", RETURN],
]);

function Token(type, literal) {
  return { type, literal };
}

let input = "let x = 54 + 30";
let position = 0;
let readPosition = 0;
let ch = "";

function readChar() {
  if (readPosition >= input.length) {
    ch = null;
  } else {
    ch = input[readPosition];
  }

  position = readPosition;
  readPosition++;
}

function nextToken() {
  let tok;
  skipWhitespace(ch);

  switch (ch) {
    case "=":
      tok = Token(ASSIGN, ch);
      break;
    case ";":
      tok = Token(SEMICOLON, ch);
      break;
    case "(":
      tok = Token(LPAREN, ch);
      break;
    case ")":
      tok = Token(RPAREN, ch);
      break;
    case "{":
      tok = Token(LBRACE, ch);
      break;
    case "}":
      tok = Token(RBRACE, ch);
      break;
    case "+":
      tok = Token(PLUS, ch);
      break;
    default:
      if (isLetter(ch)) {
        let identifier = readIdentifier();
        tok = Token(lookupIdent(identifier), identifier);
        break;
      } else if (isDigit(ch)) {
        tok = Token(INT, readNumber());
      } else {
        tok = Token(ILLEGAL, ch);
        break;
      }
  }

  readChar();
  return tok;
}

function isLetter(char) {
  return /^[a-zA-Z_]$/.test(char);
}

function isDigit(char) {
  return /^[0-9]$/.test(char);
}

function readIdentifier() {
  const startPos = position;

  while (isLetter(ch)) {
    readChar();
  }

  return input.slice(startPos, position);
}

function readNumber() {
  const startPos = position;

  while (isDigit(ch)) {
    readChar();
  }

  return input.slice(startPos, position);
}

function skipWhitespace(char) {
  if (char === " ") {
    position = readPosition;
    readPosition++;
    ch = input[position];
  }
}

function lookupIdent(ident) {
  if (keyword.has(ident)) {
    return keyword.get(ident);
  }

  return IDENT;
}

readChar();
while (ch != null) {
  const token = nextToken();
  console.log(token);
}
