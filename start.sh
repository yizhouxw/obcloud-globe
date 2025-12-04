#!/bin/bash

# Simple HTTP server to run OB Cloud Globe application
# This script starts a local web server to avoid CORS issues

PORT=${1:-8000}

echo "Starting OB Cloud Globe application..."
echo "Server will be available at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python 2, then node http-server
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    npx http-server -p $PORT
else
    echo "Error: No suitable HTTP server found."
    echo "Please install Python 3 or Node.js to run this application."
    exit 1
fi

