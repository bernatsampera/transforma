# Local Workflow Manager (locwfm)

A simple and flexible command-line tool for creating and running data processing workflows locally.

## Features

- Create standardized workflow structures with a single command
- Process files using custom transformation scripts
- Support for multiple file formats (JSON, CSV, text)
- Automatic file parsing based on file extensions
- Skip already processed files to avoid duplicates
- Force reprocessing when needed
- Custom configuration for input parsing and output formatting

## Installation

```bash
npm install -g locwfm
```

Or install locally:

```bash
npm install locwfm
```

## Usage

### Creating a Workflow

```bash
wfm create -n my-workflow
```

This creates a new workflow with the following structure:

```
my-workflow/
  ├── config/
  │   └── workflow.json    (Workflow configuration)
  ├── data/
  │   ├── input/           (Place input files here)
  │   └── output/          (Processed files will appear here)
  ├── scripts/
  │   └── transform.js     (Custom transformation script)
  └── wfconfig.js          (Custom configuration for file parsing/formatting)
```

### Running a Workflow

```bash
wfm run -c my-workflow/config/workflow.json
```

Use the `-f` or `--force` flag to reprocess all files, even if they've already been processed:

```bash
wfm run -c my-workflow/config/workflow.json -f
```

## Workflow Configuration

The `workflow.json` file defines your workflow:

```json
{
  "name": "my-workflow",
  "description": "Workflow for my-workflow",
  "version": "1.0.0",
  "input_dir": "data/input",
  "output_dir": "data/output",
  "steps": [
    {
      "name": "transform",
      "type": "transform",
      "function": "scripts/transform.js",
      "options": {
        "option1": "value1",
        "option2": "value2"
      },
      "skip_existing": true
    }
  ]
}
```

### Step Types

- `transform`: Use a custom transform function from a JavaScript file
- `built-in`: Use a built-in function (`toLowerCase`, `toUpperCase`, `template`)
- `filter`: Pass data through without changes (useful for testing)

## Custom Transform Scripts

The transform script uses CommonJS format:

```javascript
function step1(content, options) {
  // Transform your data here
  console.log("Processing with options:", options);

  if (typeof content === "object" && content !== null) {
    return {
      ...content,
      processed_at: new Date().toISOString(),
      processed_by: "LocalWFM"
    };
  }

  return content;
}

module.exports = {
  step1,
  default: step1
};
```

## Custom Configuration (wfconfig.js)

The `wfconfig.js` file allows you to customize file parsing and formatting:

```javascript
module.exports = {
  // Custom input parsers by file extension
  input: {
    parsers: {
      // Custom JSON parser
      json: (content) => {
        return JSON.parse(content);
      },

      // Custom CSV parser
      csv: (content) => {
        // CSV parsing logic
        return parsedData;
      }
    }
  },

  // Custom output formatters by file extension
  output: {
    defaultFormat: "json",
    jsonIndent: 2,

    formatters: {
      json: (data) => {
        return JSON.stringify(data, null, 2);
      },

      csv: (data) => {
        // CSV formatting logic
        return formattedData;
      }
    }
  }
};
```

## Examples

### Processing JSON Files

1. Create a workflow: `wfm create -n json-processor`
2. Place JSON files in `json-processor/data/input/`
3. Customize `json-processor/scripts/transform.js` for your transformation
4. Run: `wfm run -c json-processor/config/workflow.json`

### Processing CSV Files

1. Create a workflow: `wfm create -n csv-processor`
2. Place CSV files in `csv-processor/data/input/`
3. Customize `csv-processor/scripts/transform.js` for CSV transformations
4. Run: `wfm run -c csv-processor/config/workflow.json`

## License

MIT
