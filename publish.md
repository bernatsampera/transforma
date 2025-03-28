Here's how to publish your Local Workflow Manager library and make it available globally:

````markdown:README.md
# 🔄 Local Workflow Manager (transforma)

**Transform, process, and automate your local data workflows with zero setup.**

![npm](https://img.shields.io/npm/v/transforma)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 What is Local Workflow Manager?

Localtransforma is a zero-configuration CLI tool that lets you create standardized data processing pipelines in seconds. Perfect for:

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

## 📦 Installation

```bash
# Install globally
npm install -g transforma

# Verify installation
transforma --version
````

## 🏃‍♂️ Quick Start: JSON Processing

```bash
# Create a new workflow
transforma create -n json-processor

# Add your JSON files
cp your-data.json json-processor/data/input/

# Run the workflow
transforma run -c json-processor/config/workflow.json
```

That's it! Your processed data will be in the `json-processor/data/output` directory.

## 🛠️ Customizing Your JSON Workflow

### 1. Create your workflow

```bash
transforma create -n json-processor
```

### 2. Edit the transform script

Open `json-processor/scripts/transform.js` and customize the transformation:

```javascript
function transform(content, options) {
  // Add timestamps and additional data
  if (typeof content === "object" && content !== null) {
    return {
      ...content,
      processed_at: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      metadata: {
        processed_by: "Localtransforma",
        version: "1.0.0"
      }
    };
  }
  return content;
}

module.exports = {transform, default: transform};
```

### 3. Run your workflow

```bash
transforma run -c json-processor/config/workflow.json
```

### 4. Process files repeatedly with the force option

```bash
transforma run -c json-processor/config/workflow.json -f
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
      "function": "scripts/transform.ts",
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
function transform(content, options) {
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

module.exports = {transform};
```

## 📄 License

MIT

````
Now let's prepare your library for publication. Here are the steps to publish your Local Workflow Manager to npm:

## Publishing to npm

1. First, let's update your package.json to ensure it's ready for publishing:

```json:package.json
{
  "name": "transforma",
  "version": "1.0.0",
  "description": "Local Workflow Manager - Create and run local data processing workflows",
  "main": "dist/index.js",
  "bin": {
    "transforma": "./dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc && ./copy-templates.sh",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1",
    "prepublishOnly": "npm run build",
    "link": "npm link"
  },
  "keywords": [
    "workflow",
    "cli",
    "automation",
    "data-processing",
    "json",
    "csv",
    "etl",
    "transform"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/transforma.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/transforma/issues"
  },
  "homepage": "https://github.com/yourusername/transforma#readme",
  "engines": {
    "node": ">=14.0.0"
  },
  "dependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/inquirer": "^8.2.5",
    "@types/node": "^22.13.11",
    "chalk": "^4.1.2",
    "commander": "^11.1.0",
    "fs-extra": "^11.3.0",
    "inquirer": "^8.2.4"
  },
  "devDependencies": {
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
}
````

2. Let's create a LICENSE file for the library:

```plain text:LICENSE
MIT License

Copyright (c) 2025 Local Workflow Manager Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

3. Let's create a .npmignore file to ensure we don't publish unnecessary files:

```ignore:.npmignore
# Source files
src/
test*/
.git/
.github/
.vscode/

# Config files
tsconfig.json
.eslintrc
.prettierrc
.gitignore
.editorconfig
copy-templates.sh

# Tests
__tests__/
*.test.ts
*.test.js
coverage/

# Development files
*.log
node_modules/
npm-debug.log*
.DS_Store
```

## Steps to Publish to NPM

Now that your project files are ready, here are the exact steps to publish your package to npm:

1. **Build your package:**

```bash
npm run build
```

2. **Create an npm account** (if you don't have one):

   - Sign up at https://www.npmjs.com/signup
   - Verify your email

3. **Log in to your npm account:**

```bash
npm login
```

Enter your npm username, password, and email when prompted.

4. **Publish your package:**

```bash
npm publish
```

If this is your first time publishing this package name, it should succeed. If the name is already taken, you'll need to choose a different name in your package.json.

5. **Verify your package is published:**

Visit https://www.npmjs.com/package/transforma (replace 'transforma' with your actual package name if you changed it)

## Using Your Package Globally

Once published, anyone can install and use your package globally:

```bash
npm install -g transforma
```

This will make the `transforma` command available from any directory on their system.

## Using Your Package in a Project

To use your package in a specific project:

```bash
# Inside the project directory
npm install transforma --save
```

Then in their Node.js code:

```javascript
// Using CommonJS
const transforma = require("transforma");

// Or using ES modules
import transforma from "transforma";
```

## Testing Your Package Locally Before Publishing

To test the package locally before publishing:

1. **Create a global link:**

```bash
npm link
```

2. **Test the linked package:**

Now you can use the `transforma` command from anywhere in your system:

```bash
transforma --version
```

## Updating Your Package

When you want to update your package:

1. Make your changes
2. Update the version in package.json:
   - Use `npm version patch` for bug fixes
   - Use `npm version minor` for new features
   - Use `npm version major` for breaking changes
3. Run `npm publish` to publish the new version

## Managing Package Versions

To manage your package versions properly:

```json:package.json
// ... existing code ...
  "scripts": {
    "build": "tsc && ./copy-templates.sh",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1",
    "prepublishOnly": "npm run build",
    "link": "npm link",
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  },
// ... existing code ...
```

## Summary of Publishing Steps

Here's a complete checklist for publishing your package:

1. ✅ Update package.json with all necessary details
2. ✅ Create a LICENSE file
3. ✅ Create a good README
4. ✅ Create .npmignore
5. ✅ Build your package
6. ✅ Test locally with npm link
7. 📝 Create an npm account
8. 📝 Log in with npm login
9. 📝 Publish with npm publish
10. 📝 Verify publication on npmjs.com

Follow these steps and your Localtransforma package will be available for anyone to install and use globally!
