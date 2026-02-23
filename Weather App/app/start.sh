#!/bin/bash

# Weather App Startup Script
# This script starts both the backend server and serves the frontend

echo "Starting Weather App..."

# Start the backend server
node server/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 2

echo "Backend server started on port 3001"
echo "Frontend will be available at http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Keep script running
wait
