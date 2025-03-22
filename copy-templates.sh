#!/bin/bash

# Create templates directory in dist
mkdir -p dist/templates

# Copy all template files
cp -r src/templates/* dist/templates/

echo "Template files copied successfully!" 