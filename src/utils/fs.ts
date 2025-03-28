import fs from "fs-extra";
import path from "path";
import {log} from "./logger.js";
import {WorkflowConfig} from "../types/index.js";

/**
 * Create directories for a workflow
 */
export const createDirectories = async (
  workflowRoot: string,
  workflowConfig: WorkflowConfig
): Promise<void> => {
  try {
    const inputDir = path.join(workflowRoot, workflowConfig.input_dir);
    const outputDir = path.join(workflowRoot, workflowConfig.output_dir);

    // Create directories
    await fs.ensureDir(inputDir);
    await fs.ensureDir(outputDir);

    log.success(`Created input directory: ${inputDir}`);
    log.success(`Created output directory: ${outputDir}`);
  } catch (error) {
    throw new Error(
      `Failed to create workflow directories: ${(error as Error).message}`
    );
  }
};

/**
 * List files in a directory
 */
export const listFiles = (directoryPath: string): string[] => {
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
 * Load workflow configuration from file
 */
export const loadWorkflowConfig = (configPath: string): WorkflowConfig => {
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
 * Save workflow configuration to file
 */
export const saveWorkflowConfig = (
  configPath: string,
  config: WorkflowConfig
): void => {
  try {
    const fullPath = path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullPath);

    // Ensure the config directory exists
    fs.ensureDirSync(configDir);

    // Write the config file
    fs.writeJsonSync(fullPath, config, {spaces: 2});
    log.success(`Saved workflow configuration to ${configPath}`);
  } catch (error) {
    log.error(
      `Failed to save workflow configuration: ${(error as Error).message}`
    );
    throw error;
  }
};

/**
 * Helper to resolve a path as absolute if it's not already
 */
export const resolvePathRelativeToConfig = (
  pathToResolve: string,
  configPath: string
): string => {
  if (path.isAbsolute(pathToResolve)) {
    return pathToResolve;
  }

  // Get the directory containing the config file
  const configDir = path.dirname(path.resolve(process.cwd(), configPath));

  // Resolve the path relative to the config directory
  return path.resolve(configDir, pathToResolve);
};

/**
 * Resolve all paths in the workflow config to absolute paths
 */
export const resolveWorkflowPaths = (
  config: WorkflowConfig,
  configPath: string
): WorkflowConfig => {
  try {
    // Clone the config to avoid modifying the original
    const resolvedConfig = {...config};

    // Resolve input and output directories
    resolvedConfig.input_dir = resolvePathRelativeToConfig(
      resolvedConfig.input_dir,
      configPath
    );

    resolvedConfig.output_dir = resolvePathRelativeToConfig(
      resolvedConfig.output_dir,
      configPath
    );

    return resolvedConfig;
  } catch (error) {
    log.error(`Failed to resolve workflow paths: ${(error as Error).message}`);
    throw error;
  }
};
