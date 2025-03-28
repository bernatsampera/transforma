import fs from "fs-extra";
import path from "path";
import {log} from "./logger.js";
import {FunctionRegistry} from "../types/index.js";

/**
 * Built-in parsing functions
 */
export const parsers = {
  // Parse JSON files
  parseJSON: (filePath: string) => {
    try {
      log.info(`Parsing JSON file: ${filePath}`);
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      log.error(`Failed to parse JSON file: ${filePath}`, error as Error);
      throw error;
    }
  },

  // Parse CSV files
  parseCSV: (filePath: string, options?: {delimiter?: string}) => {
    try {
      const delimiter = options?.delimiter || ",";
      log.info(`Parsing CSV file: ${filePath} with delimiter: ${delimiter}`);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        return [];
      }

      const headers = lines[0].split(delimiter).map((header) => header.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const row: Record<string, string> = {};
        const values = lines[i].split(delimiter);

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        rows.push(row);
      }

      return rows;
    } catch (error) {
      log.error(`Failed to parse CSV file: ${filePath}`, error as Error);
      throw error;
    }
  },

  // Parse text files
  parseText: (filePath: string) => {
    try {
      log.info(`Reading text file: ${filePath}`);
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      log.error(`Failed to read text file: ${filePath}`, error as Error);
      throw error;
    }
  }
};

/**
 * Built-in transformation functions
 */
export const transformers = {
  // Transform array of objects by selecting specific fields
  selectFields: (
    data: Record<string, any>[],
    options?: {fields?: string[]}
  ) => {
    const fields = options?.fields || [];
    log.info(`Selecting fields: ${fields.join(", ")}`);

    if (!fields.length) {
      log.warning(
        "No fields specified for selectFields transformation, returning original data"
      );
      return data;
    }

    return data.map((item) => {
      const result: Record<string, any> = {};
      fields.forEach((field) => {
        result[field] = item[field];
      });
      return result;
    });
  },

  // Filter objects by a condition
  filter: (
    data: Record<string, any>[],
    options?: {fieldName?: string; value?: any}
  ) => {
    const fieldName = options?.fieldName;
    const value = options?.value;

    if (!fieldName) {
      log.warning(
        "No fieldName specified for filter transformation, returning original data"
      );
      return data;
    }

    log.info(`Filtering data where ${fieldName} = ${value}`);
    return data.filter((item) => item[fieldName] === value);
  },

  // Sort array of objects by a field
  sort: (
    data: Record<string, any>[],
    options?: {fieldName?: string; ascending?: boolean}
  ) => {
    const fieldName = options?.fieldName;
    const ascending = options?.ascending !== false; // Default to true if not specified

    if (!fieldName) {
      log.warning(
        "No fieldName specified for sort transformation, returning original data"
      );
      return data;
    }

    log.info(
      `Sorting data by ${fieldName} (${ascending ? "ascending" : "descending"})`
    );
    return [...data].sort((a, b) => {
      if (ascending) {
        return a[fieldName] > b[fieldName] ? 1 : -1;
      } else {
        return a[fieldName] < b[fieldName] ? 1 : -1;
      }
    });
  },

  // Simple passthrough transformation
  identity: (data: any) => {
    log.info("Applying identity transformation (no changes)");
    return data;
  }
};

/**
 * Built-in save functions
 */
export const savers = {
  // Save as JSON
  saveJSON: (data: any, outputPath: string, options?: {spaces?: number}) => {
    try {
      const spaces = options?.spaces || 2;
      log.info(`Saving data as JSON to: ${outputPath} (with ${spaces} spaces)`);
      fs.ensureDirSync(path.dirname(outputPath));
      fs.writeJsonSync(outputPath, data, {spaces});
      return outputPath;
    } catch (error) {
      log.error(`Failed to save JSON file: ${outputPath}`, error as Error);
      throw error;
    }
  },

  // Save as CSV
  saveCSV: (
    data: Record<string, any>[],
    outputPath: string,
    options?: {delimiter?: string}
  ) => {
    try {
      const delimiter = options?.delimiter || ",";
      log.info(
        `Saving data as CSV to: ${outputPath} with delimiter: ${delimiter}`
      );

      if (data.length === 0) {
        log.warning("No data to save as CSV");
        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, "");
        return outputPath;
      }

      // Extract headers from the first object
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(delimiter),
        ...data.map((row) =>
          headers
            .map((header) => {
              // Handle values with commas by quoting them
              const value = String(
                row[header] !== undefined ? row[header] : ""
              );
              return value.includes(delimiter) ? `"${value}"` : value;
            })
            .join(delimiter)
        )
      ].join("\n");

      fs.ensureDirSync(path.dirname(outputPath));
      fs.writeFileSync(outputPath, csvContent);
      return outputPath;
    } catch (error) {
      log.error(`Failed to save CSV file: ${outputPath}`, error as Error);
      throw error;
    }
  },

  // Save as text
  saveText: (data: string, outputPath: string) => {
    try {
      log.info(`Saving data as text to: ${outputPath}`);
      fs.ensureDirSync(path.dirname(outputPath));
      fs.writeFileSync(outputPath, data);
      return outputPath;
    } catch (error) {
      log.error(`Failed to save text file: ${outputPath}`, error as Error);
      throw error;
    }
  }
};

/**
 * Build and return a registry of all available built-in functions
 */
export const buildFunctionRegistry = (): FunctionRegistry => {
  const registry: FunctionRegistry = {};

  // Add parsers
  Object.entries(parsers).forEach(([name, func]) => {
    registry[name] = func;
  });

  // Add transformers
  Object.entries(transformers).forEach(([name, func]) => {
    registry[name] = func;
  });

  // Add savers
  Object.entries(savers).forEach(([name, func]) => {
    registry[name] = func;
  });

  return registry;
};

/**
 * Get available function names grouped by type
 */
export const getAvailableFunctions = () => {
  return {
    parsers: Object.keys(parsers),
    transformers: Object.keys(transformers),
    savers: Object.keys(savers)
  };
};
