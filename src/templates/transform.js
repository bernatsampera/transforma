/**
 * Transform function for processing files
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 * 
 * @param {any} content - The input data (parsed based on file extension)
 * @param {object} options - Options from workflow config
 * @returns {any} - The transformed data
 */
function transform(content, options, fileName) {
  // Just return the content unchanged
  // Replace this with your own transformation logic
  return content;
}

// Export using CommonJS syntax (compatible with both CommonJS and ESM projects)
module.exports = {
  transform
};

// If you're using ESM (package.json with "type": "module"), use this export instead:
/*
export function transform(content, options) {
  return content;
}

export default transform;
*/ 