const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const NODE_MODULES_DIR = path.join(__dirname, '../node_modules');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function copyFile(sourcePath, destPath, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Copying ${filename}...`);
    
    if (!fs.existsSync(sourcePath)) {
      reject(new Error(`Source file not found: ${sourcePath}`));
      return;
    }
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${filename}`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function copyIVSFiles() {
  try {
    // amazon-ivs-playerパッケージからWASMファイルをコピー
    const wasmSource = path.join(NODE_MODULES_DIR, 'amazon-ivs-player', 'dist', 'assets', 'amazon-ivs-wasmworker.min.wasm');
    const wasmDest = path.join(PUBLIC_DIR, 'amazon-ivs-wasmworker.min.wasm');
    
    const jsSource = path.join(NODE_MODULES_DIR, 'amazon-ivs-player', 'dist', 'assets', 'amazon-ivs-wasmworker.min.js');
    const jsDest = path.join(PUBLIC_DIR, 'amazon-ivs-wasmworker.min.js');
    
    await Promise.all([
      copyFile(wasmSource, wasmDest, 'amazon-ivs-wasmworker.min.wasm'),
      copyFile(jsSource, jsDest, 'amazon-ivs-wasmworker.min.js')
    ]);
    
    console.log('✓ All IVS files copied successfully');
  } catch (error) {
    console.error('Error copying IVS files:', error.message);
    console.log('Please ensure amazon-ivs-player is installed: npm install');
    process.exit(1);
  }
}

copyIVSFiles(); 