import {Command} from "commander";
import path from "path";
import fs from "fs-extra";
import {log} from "../utils/logger";
import {WorkflowConfig, WorkflowStep} from "../types";

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
 * Load workflow custom configuration
 */
const loadWorkflowCustomConfig = (workflowDir: string): any => {
  try {
    const configPath = path.join(workflowDir, "wfconfig.js");
    if (fs.existsSync(configPath)) {
      // Clear require cache in case the file was changed
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);
      log.info(`Loaded custom workflow configuration from ${configPath}`);
      return config;
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
 * Run a workflow step on a file
 */
const runWorkflowStep = async (
  filePath: string,
  step: WorkflowStep,
  workflowDir: string,
  outputDir: string,
  customConfig: any
): Promise<void> => {
  try {
    const fileName = path.basename(filePath);
    const outputPath = path.join(outputDir, fileName);

    // Skip file if it has already been processed and skip_existing is true
    if (step.skip_existing && fs.existsSync(outputPath)) {
      log.warn(`Skipping already processed file: ${fileName}`);
      return;
    }

    log.info(`Processing file: ${fileName} with step: ${step.name}`);

    // Read and parse the file content based on file extension
    let content: any;
    const fileExtension = path.extname(filePath).toLowerCase();

    // Use custom parsers if available in wfconfig.js
    if (
      customConfig?.input?.parsers &&
      customConfig.input.parsers[fileExtension.substring(1)]
    ) {
      try {
        const rawContent = fs.readFileSync(filePath, "utf-8");
        content =
          customConfig.input.parsers[fileExtension.substring(1)](rawContent);
      } catch (error) {
        log.error(
          `Failed to parse with custom parser: ${(error as Error).message}`
        );
        // Fallback to default parsing
        content = parseFileContent(filePath, fileExtension);
      }
    } else {
      // Use default parsing based on file extension
      content = parseFileContent(filePath, fileExtension);
    }

    let result: any;

    // Execute the appropriate function based on the step type
    switch (step.type) {
      case "transform":
        // Import the transform function from the specified file
        try {
          // First check if the path is relative or absolute
          let functionPath = step.function;
          if (!path.isAbsolute(functionPath)) {
            functionPath = path.resolve(workflowDir, functionPath);
          }

          // Clear require cache in case file was changed
          delete require.cache[require.resolve(functionPath)];

          const transformModule = require(functionPath);
          const transformFn =
            transformModule.default || transformModule.step1 || transformModule;
          result = await transformFn(content, step.options || {});
        } catch (error) {
          log.error(
            `Failed to execute transform function: ${step.function}`,
            error as Error
          );
          throw error;
        }
        break;

      case "built-in":
        // Use a built-in function
        result = applyBuiltInFunction(
          content,
          step.function,
          step.options || {}
        );
        break;

      case "filter":
        // For filter, we just pass the content unchanged
        result = content;
        break;

      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }

    // Write the result to the output file based on format and config
    if (customConfig?.output?.formatters && typeof result === "object") {
      const formatter =
        customConfig.output.formatters[fileExtension.substring(1)] ||
        customConfig.output.formatters[customConfig.output.defaultFormat];

      if (formatter) {
        try {
          // Use custom formatter
          const formattedResult = formatter(result);
          fs.writeFileSync(outputPath, formattedResult);
        } catch (error) {
          log.error(
            `Failed to use custom formatter: ${(error as Error).message}`
          );
          // Fallback to default formatting
          writeOutputFile(outputPath, result, customConfig);
        }
      } else {
        writeOutputFile(outputPath, result, customConfig);
      }
    } else {
      writeOutputFile(outputPath, result, customConfig);
    }

    log.success(`Successfully processed ${fileName}`);
  } catch (error) {
    log.error(`Failed to process file: ${filePath}`, error as Error);
    throw error;
  }
};

/**
 * Parse file content based on extension
 */
const parseFileContent = (filePath: string, fileExtension: string): any => {
  try {
    switch (fileExtension) {
      case ".json":
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));

      case ".csv":
        // Simple CSV parsing
        const csvContent = fs.readFileSync(filePath, "utf-8");
        const lines = csvContent.split("\n").filter((line) => line.trim());

        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim());
          return lines.slice(1).map((line) => {
            const values = line.split(",");
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || "";
            });
            return row;
          });
        }
        return [];

      default:
        // For any other file type, return as text
        return fs.readFileSync(filePath, "utf-8");
    }
  } catch (error) {
    log.error(`Failed to parse file ${filePath}: ${(error as Error).message}`);
    return fs.readFileSync(filePath, "utf-8"); // Fallback to raw content
  }
};

/**
 * Write output file based on content type and config
 */
const writeOutputFile = (
  outputPath: string,
  content: any,
  customConfig: any
): void => {
  try {
    if (typeof content === "object" && content !== null) {
      // For objects/arrays, write as JSON
      fs.writeJsonSync(outputPath, content, {
        spaces: customConfig?.output?.jsonIndent || 2
      });
    } else {
      // For strings or other types, write as is
      fs.writeFileSync(outputPath, String(content));
    }
  } catch (error) {
    log.error(`Failed to write output file: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Run the workflow
 */
export const runWorkflow = async (options: RunOptions): Promise<void> => {
  try {
    const configPath = options.config || "config/workflow.json";

    // Get the workflow directory (parent of the config directory)
    const workflowDir = path.dirname(
      path.dirname(path.resolve(process.cwd(), configPath))
    );

    // Load workflow configuration
    const config = loadWorkflowConfig(configPath);

    // Load custom configuration if exists
    const customConfig = loadWorkflowCustomConfig(workflowDir);

    // Override skip_existing if force is true
    if (options.force) {
      config.steps.forEach((step) => {
        if (step.skip_existing) {
          log.warn(
            `Force option enabled, disabling skip_existing for step: ${step.name}`
          );
          step.skip_existing = false;
        }
      });
    }

    // Resolve paths relative to the workflow directory
    const inputDir = path.resolve(workflowDir, config.input_dir);
    const outputDir = path.resolve(workflowDir, config.output_dir);

    log.info(`Using workflow directory: ${workflowDir}`);
    log.info(`Using input directory: ${inputDir}`);
    log.info(`Using output directory: ${outputDir}`);

    // Ensure output directory exists
    fs.ensureDirSync(outputDir);

    // List files in the input directory
    const inputFiles = listFiles(inputDir);

    if (inputFiles.length === 0) {
      log.warn(`No files found in input directory: ${inputDir}`);
      return;
    }

    log.info(`Found ${inputFiles.length} files to process`);

    // Process each file through each step
    for (const filePath of inputFiles) {
      for (const step of config.steps) {
        await runWorkflowStep(
          filePath,
          step,
          workflowDir,
          outputDir,
          customConfig
        );
      }
    }

    log.success(
      `Workflow completed successfully (${inputFiles.length} files processed)`
    );
  } catch (error) {
    log.error("Failed to run workflow", error as Error);
    throw error;
  }
};

/**
 * Add the run command to the program
 */
export const addRunCommand = (program: Command): void => {
  program
    .command("run")
    .description("Run a workflow")
    .option("-c, --config <path>", "Path to the workflow configuration file")
    .option(
      "-f, --force",
      "Force processing of all files, even if they have already been processed"
    )
    .action(async (options) => {
      try {
        await runWorkflow(options);
      } catch (error) {
        process.exit(1);
      }
    });
};
