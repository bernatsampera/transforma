/**
 * Default transform function for processing files
 * 
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */

function step1(content, options) {
  console.log("Processing content with options:", options);

  // If content is a string
  if (typeof content === 'string') {
    // Example: Replace placeholders with values from options
    let result = content;
    Object.entries(options).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(placeholder, String(value));
    });
    return result;
  }

  // If content is an array
  if (Array.isArray(content)) {
    // Example: Map over each item and transform it
    return content.map(item => transformItem(item, options));
  }

  // If content is an object
  if (typeof content === 'object' && content !== null) {
    // Example: Transform each property
    const result = {};
    Object.entries(content).forEach(([key, value]) => {
      result[key] = transformValue(value, options);
    });
    return result;
  }

  // Default: return content unchanged
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