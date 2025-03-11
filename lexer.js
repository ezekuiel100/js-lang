const tokenType = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",
  IDENT: "IDENT",
  INT: "INT",
  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  BANG: "!",
  ASTERISK: "*",
  SLASH: "/",
  COMMA: ",",
  SEMICOLON: ";",
  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  FUNCTION: "FUNCTION",
  LET: "LET",
  TRUE: "TRUE",
  FALSE: "FALSE",
  IF: "IF",
  ELSE: "ELSE",
  RETURN: "RETURN",
  EQ: "==",
  NOT_EQ: "!=",
  LT: "<",
  GT: ">",
};

const keyword = new Map([
  ["fn", tokenType.FUNCTION],
  ["let", tokenType.LET],
  ["true", tokenType.TRUE],
  ["false", tokenType.FALSE],
  ["if", tokenType.IF],
  ["else", tokenType.ELSE],
  ["return", tokenType.RETURN],
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
      if (peekChar("=")) {
        const char = input[position];
        readChar();
        tok = Token(EQ, char + ch);
      } else {
        tok = Token(tokenType.ASSIGN, ch);
      }
      break;
    case ";":
      tok = Token(tokenType.SEMICOLON, ch);
      break;
    case "(":
      tok = Token(tokenType.LPAREN, ch);
      break;
    case ")":
      tok = Token(tokenType.RPAREN, ch);
      break;
    case "{":
      tok = Token(tokenType.LBRACE, ch);
      break;
    case "}":
      tok = Token(tokenType.RBRACE, ch);
      break;
    case "+":
      tok = Token(tokenType.PLUS, ch);
      break;
    case "-":
      tok = Token(tokenType.MINUS, ch);
      break;
    case "!":
      if (peekChar("=")) {
        const char = input[position];
        readChar();
        tok = Token(tokenType.NOT_EQ, char + ch);
      } else {
        tok = Token(tokenType.BANG, ch);
      }
      break;
    case "/":
      tok = Token(tokenType.SLASH, ch);
      break;
    case "*":
      tok = Token(tokenType.ASTERISK, ch);
      break;
    case "<":
      tok = Token(tokenType.LT, ch);
      break;
    case ">":
      tok = Token(tokenType.GT, ch);
      break;
    case ",":
      tok = Token(tokenType.COMMA, ch);
      break;
    default:
      if (isLetter(ch)) {
        let identifier = readIdentifier();
        tok = Token(lookupIdent(identifier), identifier);
        break;
      } else if (isDigit(ch)) {
        tok = Token(tokenType.INT, readNumber());
      } else {
        tok = Token(tokenType.ILLEGAL, ch);
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

//Lidar com quebra de linha e tabulações . so pula um espaço vazio
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

  return tokenType.IDENT;
}

function peekChar(char) {
  if (input[readPosition] === char) {
    return true;
  }

  return false;
}

readChar();
while (ch != null) {
  const token = nextToken();
  console.log(token);
}
