#!/bin/sh
set -e

# Ensure persistent directories exist
mkdir -p /app/data
mkdir -p /app/uploads

echo "Prisma Pub: Initializing storage..."

# Execute the CMD from Dockerfile
exec "$@"
