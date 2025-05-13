// This is a simple script to start the app with Node.js 14
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting development server with compatibility mode...');

// Run npx with the --no-install flag to use the installed version of Vite
const child = spawn('npx', ['--no-install', 'vite', '--host', 'localhost', '--port', '8080'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Force CommonJS modules for better compatibility with Node.js 14
    NODE_OPTIONS: '--no-experimental-modules'
  }
});

child.on('error', (error) => {
  console.error('Failed to start development server:', error);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
  }
});
