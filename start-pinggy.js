const { spawn } = require('child_process');
const qrcode = require('qrcode-terminal');

console.log('⏳ Starting fast secure tunnel (Pinggy)...');

// Start pinggy via ssh
const pinggy = spawn('ssh', ['-p', '443', '-R0:localhost:8081', '-o', 'StrictHostKeyChecking=no', 'a.pinggy.io'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelUrl = '';

pinggy.stdout.on('data', (data) => {
  const output = data.toString();
  // Look for the https pinggy link
  const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.run\.pinggy-free\.link/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[0];
    console.log('✅ Tunnel connected successfully!');
    console.log('🌐 Public URL:', tunnelUrl);
    
    // Generate QR Code
    console.log('\n📱 SCAN THIS QR CODE IN YOUR DEV CLIENT APP:');
    
    // We encode the deep link. The user can just scan it from the camera or dev client
    const deepLink = `exp://expo-development-client/?url=${encodeURIComponent(tunnelUrl)}`;
    qrcode.generate(deepLink, { small: true });
    
    console.log('\n⏳ Starting Expo Server...');
    
    // Set the env var so Expo uses it for anything internal
    process.env.EXPO_PACKAGER_PROXY_URL = tunnelUrl;
    
    // Run expo
    const expo = spawn('npx.cmd', ['expo', 'start', '-c'], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
    
    expo.on('close', () => process.exit());
  }
});

pinggy.stderr.on('data', (data) => {
  // SSH outputs to stderr sometimes
  const output = data.toString();
  const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.run\.pinggy-free\.link/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[0];
    console.log('✅ Tunnel connected successfully!');
    console.log('🌐 Public URL:', tunnelUrl);
    
    console.log('\n📱 SCAN THIS QR CODE IN YOUR DEV CLIENT APP:');
    const deepLink = `exp://expo-development-client/?url=${encodeURIComponent(tunnelUrl)}`;
    qrcode.generate(deepLink, { small: true });
    
    console.log('\n⏳ Starting Expo Server...');
    process.env.EXPO_PACKAGER_PROXY_URL = tunnelUrl;
    
    const expo = spawn('npx.cmd', ['expo', 'start', '-c'], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
    
    expo.on('close', () => process.exit());
  }
});

pinggy.on('close', () => {
  if (!tunnelUrl) {
    console.log('❌ Failed to start tunnel.');
    process.exit(1);
  }
});
