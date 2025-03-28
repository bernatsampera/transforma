/**
 * Transform function for processing files
 *
 * This function will be called for each input file in the workflow.
 * Customize this function to transform your data as needed.
 */

interface TransformOptions {
  // Add your custom options here
}

/**
 * Main transform function
 *
 * @param content - The input data from files
 * @param options - Optional parameters from workflow config
 * @returns - The transformed data
 */
export function transform(content: any, options: TransformOptions = {}): any {
  // Just return the content unchanged
  // Replace this with your own transformation logic
  return content;
}

/**
 * Helper function to transform individual items
 *
 * @param item - The item to transform
 * @param options - Transformation options
 * @returns - The transformed item
 */
function transformItem(item: any, options: Record<string, any>): any {
  if (typeof item === "string") {
    // Example: Apply string transformation based on options
    if (options.uppercase) {
      return item.toUpperCase();
    }
    if (options.lowercase) {
      return item.toLowerCase();
    }
    return item;
  }

  if (typeof item === "object" && item !== null) {
    return transformValue(item, options);
  }

  return item;
}

/**
 * Helper function to transform object values
 *
 * @param value - The value to transform
 * @param options - Transformation options
 * @returns - The transformed value
 */
function transformValue(value: any, options: Record<string, any>): any {
  if (typeof value === "string") {
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
    return value.map((item) => transformItem(item, options));
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, any> = {};
    Object.entries(value).forEach(([k, v]) => {
      result[k] = transformValue(v, options);
    });
    return result;
  }

  return value;
}

// Default export for compatibility
export default transform;
