# 🔄 Transforma

**Effortless Data Transformation with JavaScript**

![npm](https://img.shields.io/npm/v/transforma)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 What is Transforma?

Transforma simplifies data processing by applying JavaScript functions to JSON/CSV files. It skips files that have already been processed, saving time and resources.

## ⚡ Quick Start

```bash
# Install
npm install -g transforma

# Create a project
transforma create my-project
```

### 📥 Input Example

Place JSON files inside `my-project/data/input/`.

#### Single JSON File (`data/input/user.json`)

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Multiple JSON Files (`data/input/`)

- `data/input/user1.json`
  ```json
  {"id": 1, "name": "Alice"}
  ```
- `data/input/user2.json`
  ```json
  {"id": 2, "name": "Bob"}
  ```

### ✍️ Define Your Transformation

Edit `my-project/transform.ts`:

```javascript
function transform(data) {
  return {
    ...data,
    processedAt: new Date().toISOString()
  };
}
```

### ▶️ Run Transformation

```bash
transforma run my-project
```

### 📤 Output Example

Processed files appear in `my-project/data/output/`.

#### Output for Single JSON (`data/output/user.json`)

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "processedAt": "2025-03-29T12:00:00.000Z"
}
```

#### Output for Multiple JSONs (`data/output/`)

- `data/output/user1.json`
  ```json
  {"id": 1, "name": "Alice", "processedAt": "2025-03-29T12:00:00.000Z"}
  ```
- `data/output/user2.json`
  ```json
  {"id": 2, "name": "Bob", "processedAt": "2025-03-29T12:00:00.000Z"}
  ```

## 📂 Project Structure

```
my-project/
├── data/
│   ├── input/      # Source files
│   └── output/     # Processed files
├── transform.ts    # Your transformation logic
└── config.json     # Optional settings
```

## 🔧 Key Features

- **Fast & Simple**: No setup, just write JavaScript.
- **Skip Processed Files**: Avoid redundant work.
- **Batch Processing**: Handle large datasets efficiently.
- **Flexible Pipelines**: Chain multiple transformation steps.

## ⏭️ Next Steps

- Add more transformations in `transform.ts`
- Customize `config.json` for multi-step processing
- Use `transforma run my-project --force` to reprocess all files

## 📄 License

MIT
