/**
 * Workflow Custom Configuration
 */

interface CustomConfig {
  input: {
    parsers: {
      [key: string]: (content: string) => any;
    };
  };
  output: {
    defaultFormat: string;
    jsonIndent: number;
    formatters: {
      [key: string]: (data: any) => string;
    };
  };
  options: {
    transform: Record<string, any>;
  };
}

const config: CustomConfig = {
  // Custom input parsers by file extension
  input: {
    parsers: {
      // Example custom JSON parser
      json: (content: string) => {
        return JSON.parse(content);
      },
    }
  },
  
  // Custom output formatters by file extension
  output: {
    // Default output format if no specific formatter is found
    defaultFormat: "json",
    
    // Number of spaces for JSON indentation
    jsonIndent: 2,
    
    formatters: {
      // Pretty JSON formatter
      json: (data: any) => {
        return JSON.stringify(data, null, 2);
      },
    }
  },
  
  // Additional configuration options
  options: {
    // Default options for transform functions
    transform: {
      // Add your default options here
    }
  }
};

export default config; 