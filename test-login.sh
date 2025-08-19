#!/bin/bash

echo "Testing login with sample user..."
echo ""

# Test login with user account
echo "🔐 Logging in as user@example.com:"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "user123"}' | python3 -m json.tool

echo ""
echo ""

# Test login with admin account
echo "🔐 Logging in as admin@example.com:"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | python3 -m json.tool

echo ""
