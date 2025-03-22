/**
 * Default transform function for processing files
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */

function step1(content, options) {
  console.log("Processing content with options:", options);

  // Add processed timestamp to the content
  if (typeof content === 'object' && content !== null) {
    // Check if content is an array (like parsed CSV)
    if (Array.isArray(content)) {
      // For arrays (like CSV data), add timestamp to each item
      return content.map(item => ({
        ...item,
        processed_at: new Date().toISOString(),
        processed_by: "LocalWFM"
      }));
    }

    // If content has an 'items' array, add timestamp to each item
    else if (content.items && Array.isArray(content.items)) {
      return {
        ...content,
        items: content.items.map(item => ({
          ...item,
          processed_at: new Date().toISOString()
        })),
        metadata: {
          processed_by: "LocalWFM",
          version: "1.0.0",
          processed_at: new Date().toISOString(),
          count: content.items.length
        }
      };
    }

    // For other objects, just add top-level timestamps
    else {
      return {
        ...content,
        processed_at: new Date().toISOString(),
        processed_by: "LocalWFM"
      };
    }
  }

  // For string content, just return it
  return content;
}

/**
 * Helper function to transform individual items
 */
function transformItem(item, options) {
  if (typeof item === 'string') {
    // Example: Apply string transformation based on options
    if (options.uppercase) {
      return item.toUpperCase();
    }
    if (options.lowercase) {
      return item.toLowerCase();
    }
    return item;
  }

  if (typeof item === 'object' && item !== null) {
    return transformValue(item, options);
  }

  return item;
}

/**
 * Helper function to transform object values
 */
function transformValue(value, options) {
  if (typeof value === 'string') {
    // Example: Apply string transformation based on options
    if (options.uppercase) {
      return value.toUpperCase();
    }
    if (options.lowercase) {
      return value.toLowerCase();
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => transformItem(item, options));
  }

  if (typeof value === 'object' && value !== null) {
    const result = {};
    Object.entries(value).forEach(([k, v]) => {
      result[k] = transformValue(v, options);
    });
    return result;
  }

  return value;
}

// Export using CommonJS syntax
module.exports = {
  step1: step1,
  // Default for compatibility
  default: step1
}; 