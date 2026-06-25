#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd ~/Projects/drl-stock-trading-app/frontend
echo "Wiping broken node_modules..."
rm -rf node_modules package-lock.json

echo "Running completely clean npm install..."
npm cache clean --force
npm install

echo "Done!"
