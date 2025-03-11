import readline from "readline";
import { stdin, stdout } from "process";
import lexer from "./lexer.mjs";

const rl = readline.createInterface({ input: stdin, output: stdout });

rl.question("Digite um codigo: ", (code) => {
  const getNextTokens = lexer(code);
  let token = getNextTokens();

  while (token.type != "EOF") {
    console.log(token);
    token = getNextTokens();
  }

  rl.close();
});
