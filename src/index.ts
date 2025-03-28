#!/usr/bin/env bun

import {Command} from "commander";
import {addCreateCommand} from "./commands/create.js";
import {addRunCommand} from "./commands/run.js";
import chalk from "chalk";

const program = new Command();

// Define the CLI
program
  .name("ft")
  .description(
    "Local Workflow Manager - Create and run local data processing workflows"
  )
  .version("1.0.0");

// Add commands
addCreateCommand(program);
addRunCommand(program);

// Debug: Log arguments
console.log('Process arguments:', process.argv);

// Show help by default if no arguments
if (process.argv.length < 3) {
  console.log(chalk.blue("Transforma 📊"));
  console.log(chalk.gray("Create and run local data processing workflows\n"));
  program.help();
}

try {
  program.parse(process.argv);
} catch (error) {
  console.error(chalk.red("Error:"), (error as Error).message);
  process.exit(1);
}
