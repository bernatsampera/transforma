/**
 * Transform function for processing input files
 */
function step1(content, options) {
  console.log("Processing content with options:", options);

  // Example implementation - this adds a processed timestamp to the content
  if (typeof content === 'object' && content !== null) {
    return {
      ...content,
      processed_at: new Date().toISOString(),
      processed_by: "LocalWFM"
    };
  }

  // For string content, just return it
  return content;
}

// Export using CommonJS syntax
module.exports = {
  step1: step1,
  // Default for compatibility
  default: step1
}; 