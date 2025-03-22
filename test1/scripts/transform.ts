/**
 * Custom functions for workflow: test1
 * 
 * WORKFLOW GUIDE:
 * 1. Add your input files to the "data/input" folder
 *    - Input format: single-json
 * 
 * 2. Implement the transformation functions below
 *    - Each function receives data from input files or previous steps
 *    - Return the processed data
 * 
 * 3. Run the workflow: wfm run -c config/workflow.json
 *    - Processed files will be saved to "data/output"
 *    - Original files will be moved to "processed directory" if specified
 */

/**
 * WORKING WITH SINGLE JSON FILE:
 * - Data is a parsed JSON object
 * - You can access properties directly: data.property
 * - Return the transformed object
 */

/**
 * Example of accessing workflow data:
 * - Input files are loaded automatically
 * - Each function receives data and optional parameters
 * - Return the transformed data
 */

/**
 * step1 function
 * Step 1: [Add your description here]
 *
 * @param data - The input data (from file or previous step)
 * @param options - Optional parameters from workflow config
 * @returns - The transformed data
 */
export const step1 = (data: any, options?: any) => {
  console.log('Processing data with step1...');
  
  // TODO: Implement your transformation logic here
  // Example transformation (modify as needed):
  if (Array.isArray(data)) {
    // Handle array data (like CSV rows or multiple items)
    return data.map(item => {
      // Transform each item
      return { ...item, processed: true };
    });
  } else if (typeof data === 'object' && data !== null) {
    // Handle object data (like JSON)
    return { ...data, processed: true };
  } else if (typeof data === 'string') {
    // Handle string data (like text files)
    return data.toUpperCase();
  }
  
  // Return original data if no transformation applied
  return data;
};


// Export all functions to make them available to the workflow engine
export default {
  step1
};
