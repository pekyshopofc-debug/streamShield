#!/bin/sh
set -e

# Apply schema changes to the database
node node_modules/prisma/build/index.js db push --skip-generate

# Start the app
exec node server.js
