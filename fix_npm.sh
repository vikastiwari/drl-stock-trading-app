#!/bin/bash
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing Node 20 (Linux Native)..."
nvm install 20
nvm use 20

echo "Cleaning and reinstalling frontend dependencies..."
cd ~/Projects/drl-stock-trading-app/frontend
rm -rf node_modules package-lock.json
npm install
echo "Done!"
