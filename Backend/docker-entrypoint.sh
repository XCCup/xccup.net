#!/bin/sh

# uninstall the current bcrypt modules
npm uninstall bcrypt

# install the bcrypt modules for the machine
# This is needed because bcrypt uses different modules for different architectures.
# If the node_modules folder is shared the process will crash otherwise.

npm install bcrypt

echo "Starting the API server..."
npm run dev 