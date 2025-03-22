/**
 * Transform function for processing files (ESM version)
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 * 
 * @param {any} content - The input data (parsed based on file extension)
 * @param {object} options - Options from workflow config
 * @returns {any} - The transformed data
 */
export function step1(content, options) {
  // Just return the content unchanged
  // Replace this with your own transformation logic
  return content;
}

// Default export for compatibility
export default step1; 