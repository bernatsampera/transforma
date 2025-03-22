/**
 * Workflow Custom Configuration
 * 
 * This file allows you to customize how files are parsed and formatted
 * in your workflow without changing the workflow configuration.
 */

module.exports = {
  // Custom input parsers by file extension
  input: {
    parsers: {
      // Example custom JSON parser with error handling
      json: (content) => {
        try {
          return JSON.parse(content);
        } catch (error) {
          console.error("Error parsing JSON:", error.message);
          return {}; // Return empty object on error
        }
      },

      // Example custom CSV parser with custom delimiter
      csv: (content) => {
        const delimiter = ","; // Change this to use different delimiter
        const lines = content.split("\n").filter(line => line.trim());

        if (lines.length === 0) return [];

        const headers = lines[0].split(delimiter).map(h => h.trim());
        return lines.slice(1).map(line => {
          const values = line.split(delimiter);
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || "";
          });
          return row;
        });
      },

      // Example custom YAML parser (requires js-yaml package)
      // yaml: (content) => {
      //   const yaml = require('js-yaml');
      //   return yaml.load(content);
      // },
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
      json: (data) => {
        return JSON.stringify(data, null, 2);
      },

      // CSV formatter (for array of objects)
      csv: (data) => {
        if (!Array.isArray(data) || data.length === 0) {
          return "";
        }

        // Get all unique headers
        const headers = Array.from(
          new Set(
            data.flatMap(item => Object.keys(item))
          )
        );

        // Create header row
        const headerRow = headers.join(",");

        // Create data rows
        const rows = data.map(item => {
          return headers
            .map(header => {
              const value = item[header] || "";
              // Escape commas and quotes
              return typeof value === 'string'
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(",");
        });

        // Combine header and rows
        return [headerRow, ...rows].join("\n");
      },

      // Plain text formatter (for strings)
      txt: (data) => {
        if (typeof data === 'string') {
          return data;
        }
        return JSON.stringify(data, null, 2);
      },

      // Example XML formatter (very basic)
      xml: (data) => {
        const objectToXml = (obj, rootName = "root") => {
          if (typeof obj !== 'object' || obj === null) {
            return `<${rootName}>${obj}</${rootName}>`;
          }

          if (Array.isArray(obj)) {
            return `<${rootName}>${obj.map((item, index) =>
              objectToXml(item, `item${index}`)
            ).join("")
              }</${rootName}>`;
          }

          return `<${rootName}>${Object.entries(obj).map(([key, value]) =>
            objectToXml(value, key)
          ).join("")
            }</${rootName}>`;
        };

        return `<?xml version="1.0" encoding="UTF-8"?>\n${objectToXml(data, "data")}`;
      }
    }
  },

  // Additional configuration options
  options: {
    // Default options for transform functions
    transform: {
      uppercase: false,
      lowercase: false,
      // Add any other default options here
    }
  }
}; 