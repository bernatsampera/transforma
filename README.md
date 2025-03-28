# 🔄 Transforma

**Transform your files with simple JavaScript - no setup required**

![npm](https://img.shields.io/npm/v/Transforma)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## In One Sentence 🎯

Transforma lets you modify JSON/CSV files using simple JavaScript functions - perfect for data cleaning, enrichment, and transformation.

## Show Me! 👀

```bash
# Install
npm install -g Transforma

# Create a project
ft new clean-data

# Drop your files in clean-data/data/input/
# Edit clean-data/transform.js:

function transform(data) {
  // Remove sensitive fields and add metadata
  const { password, ssn, ...safe } = data;
  return {
    ...safe,
    cleanedAt: new Date().toISOString()
  };
}

# Process your files
ft run clean-data
```

That's it! Find your processed files in `clean-data/data/output/` 🎉

## Real-World Examples 🌟

### 1. Clean Customer Data
```javascript
// transform.js - Remove sensitive data and format fields
function transform(customer) {
  return {
    id: customer.id,
    name: customer.name.toLowerCase().trim(),
    email: customer.email.toLowerCase(),
    // Remove credit card, SSN, etc
    lastUpdated: new Date().toISOString()
  };
}
```

### 2. Validate Product Data
```javascript
// transform.js - Ensure all required fields exist
function transform(product) {
  // Skip invalid products
  if (!product.sku || !product.price) {
    console.warn(`Skipping invalid product: ${product.id}`);
    return null;  // Returning null skips this item
  }

  return {
    ...product,
    price: Number(product.price), // Convert to number
    inStock: Boolean(product.inventory > 0)
  };
}
```

### 3. Format for Import
```javascript
// transform.js - Prepare data for system import
function transform(record) {
  return {
    externalId: `LEGACY-${record.old_id}`,
    fullName: `${record.first} ${record.last}`,
    tags: record.categories?.split(',').map(t => t.trim()) || [],
    status: record.active ? 'ACTIVE' : 'INACTIVE'
  };
}
```

## Project Layout 📁

```
clean-data/              # Your project folder
├── data/
│   ├── input/          # Put your files here
│   └── output/         # Get processed files here
├── transform.js        # Your transformation code
└── config.json        # Optional settings
```

## Features ✨

- 🚀 Start in 30 seconds
- ✍️ Transform with plain JavaScript
- 📁 Handles JSON & CSV files
- 🔄 Process files in batches
- 🎯 Skip already processed files
- 🛠️ Optional multi-step pipelines

## Advanced Usage 🔧

### Multiple Steps
```javascript
// config.json - Chain multiple transformations
{
  "steps": [
    {
      "name": "validate",     // First validate
      "file": "validate.js"
    },
    {
      "name": "transform",    // Then transform
      "file": "transform.js"
    }
  ]
}
```

### Force Reprocessing
```bash
ft run clean-data --force  # Process all files again
```

## Need Help? 🆘

- 📘 Docs: [link]
- 🐛 Issues: [link]
- 💡 Ideas: [link]

## License 📄

MIT
