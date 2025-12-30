#!/bin/bash

# Script to publish package to npm with OTP
# Usage: ./publish.sh

echo "Publishing @yasintz/md-viewer to npm..."
echo ""
read -p "Enter OTP code: " OTP_CODE

if [ -z "$OTP_CODE" ]; then
    echo "Error: OTP code is required"
    exit 1
fi

echo ""
echo "Publishing with OTP..."
npm publish --access public --otp="$OTP_CODE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully published to npm!"
else
    echo ""
    echo "❌ Failed to publish to npm"
    exit 1
fi


