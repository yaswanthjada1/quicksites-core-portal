const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess = null;
const BACKEND_PORT = process.env.PORT || '5000';
const MODEL_CHECK_TIMEOUT_MS = 45_000;

/**
 * Create and initialize the primary Electron browser window.
 * Loads the client UI from a local build output path or a configured dev URL.
 */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'client', 'dist', 'index.html')}`;
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', () => {
    backendShutdown();
  });
}

function spawnBackend() {
  const serverPath = path.join(__dirname, 'server', 'server.js');
  const env = { ...process.env, PORT: BACKEND_PORT };

  console.log(`[Electron] Starting Express backend on port ${BACKEND_PORT}...`);

  const backend = spawn('node', [serverPath], {
    cwd: path.join(__dirname, 'server'),
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backend.stdout.on('data', (chunk) => {
    process.stdout.write(`[Backend] ${chunk}`);
  });

  backend.stderr.on('data', (chunk) => {
    process.stderr.write(`[Backend ERROR] ${chunk}`);
  });

  backend.on('close', (code, signal) => {
    console.log(`[Electron] Backend process exited with code=${code} signal=${signal}`);
  });

  backend.on('error', (error) => {
    console.error('[Electron] Failed to start backend process:', error);
  });

  return backend;
}

/**
 * Terminate the backend child process gracefully, with a forced kill fallback.
 */
function backendShutdown() {
  if (!backendProcess) {
    return;
  }

  if (backendProcess.killed) {
    return;
  }

  console.log('[Electron] Shutting down backend process...');
  backendProcess.kill('SIGTERM');

  setTimeout(() => {
    if (!backendProcess.killed) {
      console.warn('[Electron] Backend process did not exit gracefully, forcing termination.');
      backendProcess.kill('SIGKILL');
    }
  }, 3000);
}

/**
 * Validate availability of the local Ollama model before launching the UI.
 * Resolves false if the model check times out or exits with a non-zero status.
 */
function validateOllamaModel() {
  return new Promise((resolve) => {
    console.log('[Electron] Running cold-boot Ollama validation...');

    const check = spawn('ollama', ['run', 'qwen2.5-coder:1.5b'], {
      windowsHide: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      if (!check.killed) {
        console.warn('[Electron] Ollama validation timed out, terminating check process.');
        check.kill('SIGTERM');
      }
      resolve(false);
    }, MODEL_CHECK_TIMEOUT_MS);

    check.stdout.on('data', (chunk) => {
      process.stdout.write(`[Ollama] ${chunk}`);
    });

    check.stderr.on('data', (chunk) => {
      process.stderr.write(`[Ollama ERROR] ${chunk}`);
    });

    check.on('close', (code) => {
      clearTimeout(timer);
      const success = code === 0;
      console.log(`[Electron] Ollama validation completed with code=${code}`);
      resolve(success);
    });

    check.on('error', (error) => {
      clearTimeout(timer);
      console.error('[Electron] Ollama validation execution failed:', error);
      resolve(false);
    });
  });
}

app.on('window-all-closed', () => {
  backendShutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  backendShutdown();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  const modelReady = await validateOllamaModel();

  if (!modelReady) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'Ollama Model Validation',
      message: 'The Ollama model validation did not complete successfully. The app will continue, but local model access may be unavailable.',
    });
  }

  backendProcess = spawnBackend();
  createWindow();
});
