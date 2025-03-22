# 🔄 Local Workflow Manager (locwfm)

**Transform, process, and automate your local data workflows with zero setup.**

![npm](https://img.shields.io/npm/v/locwfm)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 What is Local Workflow Manager?

LocalWFM is a zero-configuration CLI tool that lets you create standardized data processing pipelines in seconds. Perfect for:

- Data transformation and enrichment
- JSON processing automation
- File batch processing
- ETL pipelines without the complexity

## ✨ Features

- 📁 **Simple CLI commands** to create and run workflows
- 🔄 **Automatic file handling** for JSON, CSV, and text
- 🧩 **Customizable transforms** with plain JavaScript
- 🔍 **Smart file tracking** to avoid duplicate processing
- 📊 **Standard folder structure** for all your data projects
- ⚙️ **Module compatibility** with both CommonJS and ES Modules projects

## 📦 Installation

```bash
# Install globally
npm install -g locwfm

# Verify installation
wfm --version
```

## 🏃‍♂️ Quick Start: JSON Processing

```bash
# Create a new workflow
wfm create -n json-processor

# Add your JSON files
cp your-data.json json-processor/data/input/

# Run the workflow
wfm run -c json-processor/config/workflow.json
```

That's it! Your processed data will be in the `json-processor/data/output` directory.

> **Note**: LocalWFM automatically detects whether your project uses CommonJS or ES Modules and creates the appropriate template files.

## 🛠️ Customizing Your JSON Workflow

### 1. Create your workflow

```bash
wfm create -n json-processor
```

### 2. Edit the transform script

Open `json-processor/scripts/transform.js` and customize the transformation:

```javascript
function step1(content, options) {
  // Add timestamps and additional data
  if (typeof content === "object" && content !== null) {
    return {
      ...content,
      processed_at: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      metadata: {
        processed_by: "LocalWFM",
        version: "1.0.0"
      }
    };
  }
  return content;
}

module.exports = {step1, default: step1};
```

### 3. Run your workflow

```bash
wfm run -c json-processor/config/workflow.json
```

### 4. Process files repeatedly with the force option

```bash
wfm run -c json-processor/config/workflow.json -f
```

## 📂 Workflow Structure

```
json-processor/
  ├── config/
  │   └── workflow.json    (Workflow configuration)
  ├── data/
  │   ├── input/           (Place JSON files here)
  │   └── output/          (Processed JSON appears here)
  ├── scripts/
  │   └── transform.js     (Your custom transformation code)
  └── wfconfig.js          (Advanced configuration options)
```

## 🛠️ Workflow Configuration

The `workflow.json` file defines your processing pipeline:

```json
{
  "name": "json-processor",
  "description": "Process JSON files",
  "version": "1.0.0",
  "input_dir": "data/input",
  "output_dir": "data/output",
  "steps": [
    {
      "name": "transform",
      "type": "transform",
      "function": "scripts/transform.js",
      "options": {
        "addTimestamp": true,
        "environment": "production"
      },
      "skip_existing": true
    }
  ]
}
```

## 🔍 Advanced Features

- **Skip already processed files**: Set `skip_existing: true` in your step config
- **Force reprocessing**: Use the `-f` flag when running the workflow
- **Custom options**: Pass options to your transform functions through the workflow config
- **Multiple steps**: Chain multiple transform steps for complex processing

## 📚 Examples

### Enriching JSON data

```javascript
function step1(content, options) {
  // Add metadata to each item in an array
  if (Array.isArray(content)) {
    return content.map((item) => ({
      ...item,
      enriched: true,
      processed_at: new Date().toISOString(),
      source: options.source || "unknown"
    }));
  }

  // Process a single JSON object
  return {
    ...content,
    enriched: true,
    processed_at: new Date().toISOString()
  };
}

module.exports = {step1};
```

## 📄 License

MIT
