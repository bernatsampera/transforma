import {Command} from "commander";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import {log} from "../utils/logger";
import {WorkflowConfig, WorkflowStep} from "../types";
import {createDirectories, saveWorkflowConfig} from "../utils/fs";

export interface CreateOptions {
  name?: string;
  dir?: string;
}

/**
 * Detect if the project is using ES modules
 */
const isEsmProject = (dir: string): boolean => {
  try {
    // Check for package.json
    const packageJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      return packageJson.type === "module";
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Create a new workflow
 */
export const createWorkflow = async (options: CreateOptions): Promise<void> => {
  try {
    // Prompt for workflow name if not provided
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of your workflow?",
        default: options.name || "my-workflow",
        when: !options.name
      }
    ]);

    const workflowName = answers.name || options.name;
    const workflowDir = options.dir || workflowName;

    log.info(
      `Creating workflow "${workflowName}" in directory: ${workflowDir}`
    );

    // Create the workflow root directory
    await fs.ensureDir(workflowDir);

    // Check if we're in an ESM project
    const isEsm = isEsmProject(process.cwd());
    const transformExtension = isEsm ? ".mjs" : ".js";

    // Create standard directories for the workflow
    const workflowConfig: WorkflowConfig = {
      name: workflowName,
      description: `Workflow for ${workflowName}`,
      version: "1.0.0",
      input_dir: "data/input",
      output_dir: "data/output",
      steps: [
        {
          name: "transform",
          type: "transform",
          function: `scripts/transform${transformExtension}`,
          options: {
            // Default options for the transform function
          },
          skip_existing: true
        }
      ]
    };

    // Create the directory structure based on the config
    await createDirectories(workflowDir, workflowConfig);

    // Create additional directories
    const configDir = path.join(workflowDir, "config");
    const scriptsDir = path.join(workflowDir, "scripts");

    await fs.ensureDir(configDir);
    await fs.ensureDir(scriptsDir);

    log.success(`Created config directory: ${configDir}`);
    log.success(`Created scripts directory: ${scriptsDir}`);

    // Save the workflow configuration
    const configPath = path.join(workflowDir, "config", "workflow.json");
    saveWorkflowConfig(configPath, workflowConfig);

    // Create a template transform script based on module type
    await createTransformScript(scriptsDir, isEsm);

    // Create a wfconfig.js file for custom configuration
    await createCustomConfigFile(workflowDir);

    // Detect module format and show appropriate guidance
    const moduleFormat = isEsm ? "ES modules (ESM)" : "CommonJS";

    log.success(`
Workflow "${workflowName}" created successfully!

Directory structure:
- ${workflowDir}/
  - config/
    - workflow.json       (Workflow configuration)
  - data/
    - input/              (Place input files here)
    - output/             (Processed files will appear here)
  - scripts/
    - transform${transformExtension}        (Transform script with step1 function)
  - wfconfig.js           (Custom configuration for parsers and formatters)

Detected module format: ${moduleFormat}

To use the workflow:
1. Place your input files in the data/input directory
2. Run: wfm run -c ${workflowDir}/config/workflow.json
`);
  } catch (error) {
    log.error("Failed to create workflow", error as Error);
    throw error;
  }
};

/**
 * Create a template transform script
 */
const createTransformScript = async (
  scriptsDir: string,
  isEsm: boolean
): Promise<void> => {
  try {
    const templateName = isEsm ? "transform.mjs" : "transform.js";
    const scriptPath = path.join(scriptsDir, templateName);

    // Get the template from our templates directory
    const templatePath = path.join(__dirname, "..", "templates", templateName);

    if (fs.existsSync(templatePath)) {
      // Copy the template file
      await fs.copy(templatePath, scriptPath);
    } else {
      // Fallback if template doesn't exist
      if (isEsm) {
        // ESM template
        const scriptContent = `/**
 * Transform function for processing files (ESM version)
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */
export function step1(content, options) {
  // Just return the content unchanged
  // Replace this with your own transformation logic
  return content;
}

// Default export for compatibility
export default step1;
`;
        await fs.writeFile(scriptPath, scriptContent);
      } else {
        // CommonJS template
        const scriptContent = `/**
 * Transform function for processing files
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */
function step1(content, options) {
  // Just return the content unchanged
  // Replace this with your own transformation logic
  return content;
}

// Export using CommonJS syntax
module.exports = {
  step1,
  default: step1
};
`;
        await fs.writeFile(scriptPath, scriptContent);
      }
    }

    log.success(`Created transform script: ${scriptPath}`);
  } catch (error) {
    log.error(`Failed to create transform script: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Create a custom configuration file
 */
const createCustomConfigFile = async (workflowDir: string): Promise<void> => {
  try {
    const configPath = path.join(workflowDir, "wfconfig.js");

    // Get the template from our templates directory
    const templatePath = path.join(__dirname, "..", "templates", "wfconfig.js");

    if (fs.existsSync(templatePath)) {
      // Copy the template file
      await fs.copy(templatePath, configPath);
    } else {
      // Fallback if template doesn't exist
      const configContent = `/**
 * Workflow Custom Configuration
 */
module.exports = {
  // Custom input parsers by file extension
  input: {
    parsers: {
      // Example custom JSON parser
      json: (content) => {
        return JSON.parse(content);
      },
    }
  },
  
  // Custom output formatters by file extension
  output: {
    // Default output format if no specific formatter is found
    defaultFormat: "json",
    
    // Number of spaces for JSON indentation
    jsonIndent: 2,
    
    formatters: {
      // Pretty JSON formatter
      json: (data) => {
        return JSON.stringify(data, null, 2);
      },
    }
  },
  
  // Additional configuration options
  options: {
    // Default options for transform functions
    transform: {
      // Add your default options here
    }
  }
};`;
      await fs.writeFile(configPath, configContent);
    }

    log.success(`Created custom configuration file: ${configPath}`);
  } catch (error) {
    log.error(
      `Failed to create custom configuration file: ${(error as Error).message}`
    );
    throw error;
  }
};

/**
 * Add the create command to the program
 */
export const addCreateCommand = (program: Command): void => {
  program
    .command("create")
    .description("Create a new workflow")
    .option("-n, --name <name>", "Name of the workflow")
    .option("-d, --dir <directory>", "Directory to create the workflow in")
    .action(async (options) => {
      try {
        await createWorkflow(options);
      } catch (error) {
        process.exit(1);
      }
    });
};
