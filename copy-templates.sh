#!/bin/bash

# Create templates directory in dist
mkdir -p dist/templates

# Copy all template files
cp -r src/templates/* dist/templates/

# Make sure transform.mjs is included (explicitly copy it to be sure)
if [ -f src/templates/transform.mjs ]; then
    cp src/templates/transform.mjs dist/templates/
fi

echo "Template files copied successfully!" 