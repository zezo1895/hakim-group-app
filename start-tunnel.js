const { spawn, exec } = require('child_process');
const http = require('http');

// Helper to wait for ngrok URL
function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (attempts > 15) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for ngrok url'));
        return;
      }
      
      http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.tunnels && json.tunnels.length > 0) {
              clearInterval(interval);
              resolve(json.tunnels[0].public_url);
            }
          } catch (e) {}
        });
      }).on('error', () => {
        // Ngrok API not ready yet, will retry
      });
    }, 1000);
  });
}

(async () => {
  try {
    console.log('⏳ Starting Ngrok manually...');
    
    // 1. Start ngrok
    const ngrokProcess = spawn('npx.cmd', ['--yes', 'ngrok', 'http', '8081'], {
      stdio: 'ignore', // run silently
      shell: true,
      detached: true
    });
    
    // 2. Wait for ngrok URL
    console.log('⏳ Waiting for Ngrok to give us a public URL...');
    const url = await getNgrokUrl();
    console.log('✅ Ngrok Tunnel successfully started at:', url);
    console.log('📱 The QR code below is perfectly safe to scan!');
    
    // 3. Start Expo with proxy URL
    process.env.EXPO_PACKAGER_PROXY_URL = url;
    
    const expoProcess = spawn('npx.cmd', ['expo', 'start', '-c'], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
    
    // Cleanup on exit
    const cleanup = () => {
      try { process.kill(-ngrokProcess.pid); } catch(e){}
      try { process.kill(-expoProcess.pid); } catch(e){}
      process.exit();
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    expoProcess.on('close', cleanup);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
