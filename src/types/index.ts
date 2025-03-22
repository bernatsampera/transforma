/**
 * Workflow step type
 */
export type StepType = "transform" | "filter" | "built-in";

/**
 * Workflow step
 */
export interface WorkflowStep {
  name: string;
  type: "transform" | "built-in" | "filter";
  function: string;
  options?: Record<string, any>;
  skip_existing?: boolean;
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  name: string;
  description?: string;
  version?: string;
  input_dir: string;
  output_dir: string;
  steps: WorkflowStep[];
}

/**
 * Function registry
 */
export type FunctionRegistry = Record<string, Function>;

/**
 * Create workflow answers from inquirer
 */
export interface WorkflowAnswers {
  name: string;
  createFolders: boolean;
  inputDir: string;
  outputDir: string;
  processedDir?: string;
  stepCount: number;
  steps: {
    name: string;
    type: StepType;
    function: string;
    customFunction?: string;
    skip_existing?: boolean;
  }[];
  inputFormat?: string;
  hasInputFormat?: boolean;
}
