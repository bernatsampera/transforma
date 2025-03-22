import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

// Ensure logs directory exists
const createLogsDir = (): string => {
  const logsDir = path.join(process.cwd(), "logs");
  fs.ensureDirSync(logsDir);
  return logsDir;
};

// Get timestamp for logs
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Logger utility for workflow manager
 */
export const log = {
  /**
   * Log informational message
   */
  info: (message: string): void => {
    const timestamp = getTimestamp();
    const formattedMessage = `[INFO] ${timestamp}: ${message}`;
    console.log(chalk.blue("INFO:"), message);

    const logsDir = createLogsDir();
    const logFile = path.join(
      logsDir,
      `wfm-${new Date().toISOString().split("T")[0]}.log`
    );
    fs.appendFileSync(logFile, formattedMessage + "\n");
  },

  /**
   * Log success message
   */
  success: (message: string): void => {
    const timestamp = getTimestamp();
    const formattedMessage = `[SUCCESS] ${timestamp}: ${message}`;
    console.log(chalk.green("SUCCESS:"), message);

    const logsDir = createLogsDir();
    const logFile = path.join(
      logsDir,
      `wfm-${new Date().toISOString().split("T")[0]}.log`
    );
    fs.appendFileSync(logFile, formattedMessage + "\n");
  },

  /**
   * Log warning message
   */
  warning: (message: string, error?: Error): void => {
    const timestamp = getTimestamp();
    const errorDetails = error ? `\n${error.stack}` : "";
    const formattedMessage = `[WARNING] ${timestamp}: ${message}${errorDetails}`;
    console.log(chalk.yellow("WARNING:"), message);
    if (error) {
      console.log(chalk.yellow("Error details:"), error.message);
    }

    const logsDir = createLogsDir();
    const logFile = path.join(
      logsDir,
      `wfm-${new Date().toISOString().split("T")[0]}.log`
    );
    fs.appendFileSync(logFile, formattedMessage + "\n");
  },

  /**
   * Log warning message (alias for warning)
   */
  warn: (message: string, error?: Error): void => {
    log.warning(message, error);
  },

  /**
   * Log error message
   */
  error: (message: string, error?: Error): void => {
    const timestamp = getTimestamp();
    const errorDetails = error ? `\n${error.stack}` : "";
    const formattedMessage = `[ERROR] ${timestamp}: ${message}${errorDetails}`;
    console.error(chalk.red("ERROR:"), message);
    if (error) {
      console.error(chalk.red("Error details:"), error.message);
      if (error.stack) {
        console.error(chalk.red("Stack trace:"), error.stack);
      }
    }

    const logsDir = createLogsDir();
    const logFile = path.join(
      logsDir,
      `wfm-${new Date().toISOString().split("T")[0]}.log`
    );
    fs.appendFileSync(logFile, formattedMessage + "\n");
  }
};
