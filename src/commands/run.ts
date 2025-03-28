import {Command} from "commander";
import path from "path";
import fs from "fs-extra";
import {log} from "../utils/logger.js";
import {WorkflowConfig, WorkflowStep} from "../types/index.js";
import {spawn} from "child_process";
import os from "os";
import chalk from "chalk";

interface RunOptions {
  config: string;
  force?: boolean;
}

/**
 * Apply a built-in function to the content
 */
const applyBuiltInFunction = (
  content: any,
  functionName: string,
  options: Record<string, any>
): any => {
  switch (functionName) {
    case "toUpperCase":
      if (typeof content === "string") {
        return content.toUpperCase();
      } else if (typeof content === "object" && content !== null) {
        // For objects, try to uppercase string values
        if (Array.isArray(content)) {
          return content.map((item) =>
            typeof item === "string" ? item.toUpperCase() : item
          );
        } else {
          const result: Record<string, any> = {};
          Object.entries(content).forEach(([key, value]) => {
            result[key] =
              typeof value === "string" ? value.toUpperCase() : value;
          });
          return result;
        }
      }
      return content;

    case "toLowerCase":
      if (typeof content === "string") {
        return content.toLowerCase();
      } else if (typeof content === "object" && content !== null) {
        // For objects, try to lowercase string values
        if (Array.isArray(content)) {
          return content.map((item) =>
            typeof item === "string" ? item.toLowerCase() : item
          );
        } else {
          const result: Record<string, any> = {};
          Object.entries(content).forEach(([key, value]) => {
            result[key] =
              typeof value === "string" ? value.toLowerCase() : value;
          });
          return result;
        }
      }
      return content;

    case "template":
      // Replace placeholders in the template with values from options
      if (typeof content === "string") {
        let result = content;
        Object.entries(options).forEach(([key, value]) => {
          const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
          result = result.replace(placeholder, String(value));
        });
        return result;
      }
      return content;

    default:
      throw new Error(`Unknown built-in function: ${functionName}`);
  }
};

/**
 * Execute a transform script using Bun
 */
async function executeTransformScript(
  scriptPath: string,
  content: any,
  options: Record<string, any> = {}
): Promise<any> {
  try {
    // Create a temporary directory for our executor script and data
    const tmpDir = path.join(os.tmpdir(), `wfm_${Date.now()}`);
    fs.ensureDirSync(tmpDir);

    // Write the content to a temp file
    const contentPath = path.join(tmpDir, "content.json");
    fs.writeJsonSync(contentPath, content, {spaces: 2});

    // Write the options to a temp file
    const optionsPath = path.join(tmpDir, "options.json");
    fs.writeJsonSync(optionsPath, options, {spaces: 2});

    // Create a small executor script that will run the transform
    const executorPath = path.join(tmpDir, "executor.ts");
    const executorContent = `
import { readFileSync } from 'fs';
import { join } from 'path';

interface TransformOptions {
  [key: string]: any;
}

async function run() {
  try {
    // Redirect console.log to stderr so it doesn't interfere with our JSON output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      console.error('LOG:', ...args);
    };
    
    // Read input content and options
    const content = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const options = JSON.parse(readFileSync(process.argv[3], 'utf8')) as TransformOptions;
    const scriptPath = process.argv[4];
    
    // Dynamically import the transform script
    const transformModule = await import(scriptPath);
    
    // Get the transform function
    const transformFn = transformModule.default || transformModule.step1 || transformModule;
    
    // Execute the transform
    let result;
    if (typeof transformFn === 'function') {
      result = await transformFn(content, options);
    } else if (transformFn && typeof transformFn.step1 === 'function') {
      result = await transformFn.step1(content, options);
    } else {
      throw new Error('No valid transform function found');
    }
    
    // Restore original console.log
    console.log = originalConsoleLog;
    
    // Write the result to stdout - this must be the only thing written to stdout
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});
`;

    fs.writeFileSync(executorPath, executorContent);

    // Run the executor script with Bun
    const scriptAbsPath = path.resolve(scriptPath);
    const childProcess = spawn("bun", [
      executorPath,
      contentPath,
      optionsPath,
      scriptAbsPath
    ]);

    let stdout = "";
    let stderr = "";

    childProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      const message = data.toString();
      if (message.startsWith("LOG:")) {
        // This is a redirected console.log from the transform function
        console.log(`[Transform Log] ${message.substring(4).trim()}`);
      } else {
        // This is an actual error
        stderr += message;
      }
    });

    return new Promise((resolve, reject) => {
      childProcess.on("close", (code) => {
        // Clean up temp files
        try {
          fs.removeSync(tmpDir);
        } catch (error) {
          // Ignore cleanup errors
        }

        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error: any) {
            reject(
              new Error(`Failed to parse transform result: ${error.message}`)
            );
          }
        } else {
          reject(new Error(`Transform script failed: ${stderr}`));
        }
      });
    });
  } catch (error: any) {
    throw new Error(`Failed to execute transform script: ${error.message}`);
  }
}

/**
 * Load workflow custom configuration
 */
const loadWorkflowCustomConfig = async (workflowDir: string): Promise<any> => {
  try {
    const configPath = path.join(workflowDir, "wfconfig.js");

    if (fs.existsSync(configPath)) {
      try {
        // Use the same child process approach to load wfconfig.js
        const content = {}; // Empty content for wfconfig
        const result = await executeTransformScript(configPath, content);
        log.info(`Loaded custom workflow configuration from ${configPath}`);
        return result;
      } catch (error) {
        log.warn(
          `Failed to load custom configuration: ${(error as Error).message}`
        );
        return {};
      }
    }
    return {};
  } catch (error) {
    log.warn(
      `Failed to load custom configuration: ${(error as Error).message}`
    );
    return {};
  }
};

/**
 * Load workflow configuration from file
 */
const loadWorkflowConfig = (configPath: string): WorkflowConfig => {
  try {
    const fullPath = path.resolve(process.cwd(), configPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Configuration file not found: ${fullPath}`);
    }

    const config = fs.readJsonSync(fullPath) as WorkflowConfig;
    log.info(`Loaded workflow configuration from ${configPath}`);
    return config;
  } catch (error) {
    log.error(
      `Failed to load workflow configuration: ${(error as Error).message}`
    );
    throw error;
  }
};

/**
 * List files in a directory
 */
const listFiles = (directoryPath: string): string[] => {
  try {
    if (!fs.existsSync(directoryPath)) {
      log.error(`Directory does not exist: ${directoryPath}`);
      return [];
    }

    return fs
      .readdirSync(directoryPath)
      .filter((fileName) =>
        fs.statSync(path.join(directoryPath, fileName)).isFile()
      )
      .map((fileName) => path.join(directoryPath, fileName));
  } catch (error) {
    log.error(
      `Failed to list files in ${directoryPath}: ${(error as Error).message}`
    );
    return [];
  }
};

/**
 * Run a workflow step
 */
const runWorkflowStep = async (
  filePath: string,
  step: WorkflowStep,
  workflowDir: string,
  outputDir: string,
  customConfig: any
): Promise<void> => {
  try {
    log.info(`Processing file: ${filePath}`);
    log.info(`Applying step: ${step.name} (${step.type})`);

    // Get file extension
    const fileExtension = path.extname(filePath).toLowerCase().slice(1);

    // Parse input file
    const content = parseFileContent(filePath, fileExtension);

    // Process the content based on step type
    let result;
    if (step.type === "built-in") {
      result = applyBuiltInFunction(content, step.function, step.options || {});
    } else if (step.type === "transform") {
      // Resolve the transform script path relative to the workflow directory
      const scriptPath = path.resolve(workflowDir, step.function);
      result = await executeTransformScript(scriptPath, content, step.options || {});
    } else {
      throw new Error(`Unsupported step type: ${step.type}`);
    }

    // Generate output filename
    const outputFileName = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(outputDir, `${outputFileName}.json`);

    // Write output file
    writeOutputFile(outputPath, result, customConfig);

    log.success(`Processed file: ${filePath} -> ${outputPath}`);
  } catch (error) {
    log.error(`Failed to process file: ${filePath}`, error as Error);
    throw error;
  }
};

/**
 * Parse file content based on file extension
 */
const parseFileContent = (filePath: string, fileExtension: string): any => {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    switch (fileExtension) {
      case "json":
        return JSON.parse(content);
      case "csv":
        // Simple CSV parsing - can be enhanced with a CSV library
        const lines = content.split("\n").filter((line) => line.trim());
        if (lines.length === 0) return [];
        const headers = lines[0].split(",").map((h) => h.trim());
        return lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
      default:
        return content;
    }
  } catch (error) {
    log.error(
      `Failed to parse file ${filePath}: ${(error as Error).message}`
    );
    throw error;
  }
};

/**
 * Write output file with appropriate formatting
 */
const writeOutputFile = (
  outputPath: string,
  content: any,
  customConfig: any
): void => {
  try {
    const outputFormat = customConfig.output?.defaultFormat || "json";
    const formatter = customConfig.output?.formatters?.[outputFormat];

    let outputContent: string;
    if (formatter) {
      outputContent = formatter(content);
    } else {
      // Default to pretty JSON
      outputContent = JSON.stringify(content, null, 2);
    }

    fs.ensureDirSync(path.dirname(outputPath));
    fs.writeFileSync(outputPath, outputContent);
  } catch (error) {
    log.error(
      `Failed to write output file ${outputPath}: ${(error as Error).message}`
    );
    throw error;
  }
};

/**
 * Run a workflow
 */
export const runWorkflow = async (options: RunOptions): Promise<void> => {
  try {
    // Load workflow configuration
    const config = loadWorkflowConfig(options.config);
    const configDir = path.dirname(path.resolve(process.cwd(), options.config));
    const workflowDir = path.dirname(configDir); // Go up one level from config directory

    // Resolve input and output directories relative to the workflow directory
    const inputDir = path.resolve(workflowDir, config.input_dir);
    const outputDir = path.resolve(workflowDir, config.output_dir);

    // Load custom configuration if available
    const customConfig = await loadWorkflowCustomConfig(workflowDir);

    // Get input files
    const inputFiles = listFiles(inputDir);

    if (inputFiles.length === 0) {
      log.warning("No input files found in the input directory");
      return;
    }

    // Process each input file
    for (const filePath of inputFiles) {
      try {
        // Skip if output already exists and force is not set
        const outputFileName = path.basename(filePath, path.extname(filePath));
        const outputPath = path.join(outputDir, `${outputFileName}.json`);

        if (fs.existsSync(outputPath) && !options.force) {
          log.warning(
            `Output file already exists: ${outputPath}. Use --force to overwrite.`
          );
          continue;
        }

        // Run each step in sequence
        for (const step of config.steps) {
          await runWorkflowStep(filePath, step, workflowDir, outputDir, customConfig);
        }
      } catch (error) {
        log.error(`Failed to process file: ${filePath}`, error as Error);
        if (!options.force) {
          throw error;
        }
      }
    }

    log.success("Workflow completed successfully!");
  } catch (error) {
    log.error("Workflow failed", error as Error);
    throw error;
  }
};

/**
 * Add the run command to the CLI program
 */
export const addRunCommand = (program: Command): void => {
  program
    .command("run")
    .description("Run a workflow")
    .requiredOption("-c, --config <path>", "Path to workflow configuration file")
    .option("-f, --force", "Force overwrite of existing output files")
    .action(async (options: RunOptions) => {
      try {
        await runWorkflow(options);
      } catch (error) {
        console.error(chalk.red("Error:"), (error as Error).message);
        process.exit(1);
      }
    });
};
