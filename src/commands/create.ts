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
          function: "scripts/transform.js",
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

    // Create a template transform script
    await createTransformScript(scriptsDir);

    // Create a wfconfig.js file for custom configuration
    await createCustomConfigFile(workflowDir);

    log.success(`
Workflow "${workflowName}" created successfully!

Directory structure:
- ${workflowDir}/
  - config/
    - workflow.json       (Workflow configuration)
  - data/
    - input/              (Place input files here)
    - output/             (Processed files will be output here)
  - scripts/
    - transform.js        (Transform script with step1 function)
  - wfconfig.js           (Custom configuration for parsers and formatters)

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
const createTransformScript = async (scriptsDir: string): Promise<void> => {
  try {
    const scriptPath = path.join(scriptsDir, "transform.js");

    // Get the template from our templates directory
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "transform.js"
    );

    if (fs.existsSync(templatePath)) {
      // Copy the template file
      await fs.copy(templatePath, scriptPath);
    } else {
      // Fallback if template doesn't exist
      const scriptContent = `/**
 * Transform function for processing input files
 */
function step1(content, options) {
  console.log("Processing content with options:", options);
  
  // If content is a string
  if (typeof content === 'string') {
    // Example: Replace placeholders with values from options
    let result = content;
    Object.entries(options).forEach(([key, value]) => {
      const placeholder = new RegExp(\`\\{\\{\\s*\${key}\\s*\\}\\}\`, "g");
      result = result.replace(placeholder, String(value));
    });
    return result;
  }
  
  // If content is an object
  if (typeof content === 'object' && content !== null) {
    // Example: Return a transformed copy of the object
    return {
      ...content,
      processed_at: new Date().toISOString(),
      processed_by: "LocalWFM"
    };
  }
  
  // Default: return content unchanged
  return content;
}

// Export using CommonJS syntax
module.exports = {
  step1: step1,
  // Default for compatibility
  default: step1
};
`;
      await fs.writeFile(scriptPath, scriptContent);
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
