# Local Workflow Manager Product Context

## Why This Project Exists

Local Workflow Manager (transforma) addresses a common pain point in data processing: the complexity of setting up and maintaining data transformation workflows. Many developers and data analysts need to process files locally but find themselves either:

1. Writing one-off scripts that are hard to maintain
2. Using complex ETL tools that are overkill for simple tasks
3. Struggling with inconsistent file processing patterns

## Problems It Solves

1. **Setup Complexity**: Eliminates the need for complex configuration and setup
2. **Consistency**: Provides a standardized way to handle data processing
3. **Efficiency**: Prevents duplicate processing through smart tracking
4. **Flexibility**: Allows custom transformations without framework lock-in
5. **Maintainability**: Creates organized project structures automatically

## How It Should Work

### User Experience Flow

1. **Initial Setup**
   ```bash
   npm install -g transforma
   ```

2. **Creating a Workflow**
   ```bash
   transforma create -n my-workflow
   ```

3. **Adding Data**
   - Place input files in `my-workflow/data/input/`
   - Files can be JSON, CSV, or text

4. **Defining Transformations**
   - Edit `my-workflow/scripts/transform.js`
   - Write plain JavaScript functions
   - Chain multiple steps if needed

5. **Running the Workflow**
   ```bash
   transforma run -c my-workflow/config/workflow.json
   ```

6. **Viewing Results**
   - Processed files appear in `my-workflow/data/output/`
   - Each file is processed only once unless forced

### Key User Interactions

1. **Workflow Creation**
   - Simple command to create new workflow
   - Automatic project structure generation
   - Template files for common use cases

2. **Configuration**
   - JSON-based workflow configuration
   - Easy to understand and modify
   - Supports multiple processing steps

3. **Transformation**
   - Plain JavaScript for transformations
   - Access to Node.js ecosystem
   - Support for async operations

4. **Execution**
   - Single command to run workflow
   - Progress feedback
   - Error handling and reporting

## User Experience Goals

1. **Simplicity**
   - Zero configuration required
   - Intuitive commands
   - Clear feedback

2. **Reliability**
   - Consistent behavior
   - No data loss
   - Clear error messages

3. **Flexibility**
   - Custom transformations
   - Multiple file formats
   - Extensible architecture

4. **Efficiency**
   - Fast execution
   - Smart file tracking
   - Minimal resource usage

5. **Maintainability**
   - Clear project structure
   - Well-documented code
   - Easy to debug

### 2. Edit the transform script

Open `json-processor/scripts/transform.ts` and customize the transformation:

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

module.exports = { transform }; 