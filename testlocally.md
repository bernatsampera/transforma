Yes, absolutely! You can test your package locally before publishing it to npm using either `npm link` or installing it directly from your local directory. Let me show you both methods:

### Method 1: Using npm link (Recommended for development)

This creates a symbolic link to your package globally. Here's how to do it:

1. First, let's make sure your CLI name in the program matches the binary name:

```typescript:src/index.ts
// Define the CLI
program
  .name("transforma")
  .description(
    "Local Workflow Manager - Create and run local data processing workflows"
  )
  .version("1.0.0");

// ... existing code ...
```
Now you can test it locally by following these steps:

1. First, build your package:
```bash
bun run build
```

2. In your package directory, run:
```bash
npm link
```

3. Now you can use the `transforma` command globally:
```bash
transforma --version
```

To unlink later, you can run:
```bash
npm unlink transforma
```

### Method 2: Installing from local directory

You can also install the package directly from your local directory:

1. First, build your package:
```bash
bun run build
```

2. Then install it globally using the local path:
```bash
npm install -g .
```

This will install your package globally as if it was from npm, but using your local files instead.

To uninstall:
```bash
npm uninstall -g transforma
```

### Testing the Installation

After using either method, you can verify the installation by running:
```bash
transforma --version
transforma --help
```

You should see your CLI's help output and version information.

### Troubleshooting

If you run into any permission issues with global installation, you might need to use `sudo` on Unix-based systems:
```bash
sudo npm link
# or
sudo npm install -g .
```

Remember that every time you make changes to your code:
1. Run `bun run build` to rebuild the package
2. If using npm link, the changes will be reflected immediately
3. If using local installation, you'll need to run `npm install -g .` again

I recommend using the `npm link` method during development as it's more convenient - you won't need to reinstall the package after each change, just rebuild it.

Let me know if you run into any issues or need clarification!
