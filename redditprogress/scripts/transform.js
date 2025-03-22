/**
 * Default transform function for processing files
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */

function step1(content, options) {
  console.log("Processing content with options:", options);

  const result = Object.values(content).map(item => {
    return {
      ...item,
      id: 2323
    }
  });


  // Default: return content unchanged
  return result;
}


// Export using CommonJS syntax
module.exports = {
  step1: step1,
  // Default for compatibility
  default: step1
}; 