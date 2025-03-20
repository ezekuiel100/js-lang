import readline from "readline";
import { stdin, stdout } from "process";
import lexer from "./lexer.mjs";
import { Parser } from "./parse.mjs";

const rl = readline.createInterface({ input: stdin, output: stdout });

rl.question("Digite um codigo: ", (code) => {
  const getNextTokens = lexer(code);
  const { parseProgram, errors } = Parser(getNextTokens);

  const program = parseProgram();
  console.log(program);

  if (errors.length > 0) {
    console.log("Error");
  }

  rl.close();
});
