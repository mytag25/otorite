const concurrently = require('concurrently');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';
const rootDir = path.resolve(__dirname, '..');

// 1. Determine Python Interpreter Path
// We prefer the virtual environment if it exists
let pythonPath = 'python'; // Fallback to system python
const venvDir = path.join(rootDir, '.venv');

if (fs.existsSync(venvDir)) {
    if (isWindows) {
        const winPython = path.join(venvDir, 'Scripts', 'python.exe');
        if (fs.existsSync(winPython)) {
            pythonPath = winPython;
        }
    } else {
        const linuxPython = path.join(venvDir, 'bin', 'python');
        if (fs.existsSync(linuxPython)) {
            pythonPath = linuxPython;
        }
    }
}

// Wrap paths in quotes if they have spaces (common on Windows)
if (pythonPath.includes(' ')) {
    pythonPath = `"${pythonPath}"`;
}

console.log(`[Boot] Detected Platform: ${os.platform()}`);
console.log(`[Boot] Using Python: ${pythonPath}`);

// 2. Define Commands
const backendCommand = `cd backend && ${pythonPath} -m uvicorn server:app --reload --host 0.0.0.0 --port 8001`;
const frontendCommand = isWindows
    ? `cd frontend && set HOST=0.0.0.0&& set PORT=80&& npm start`
    : `cd frontend && HOST=0.0.0.0 PORT=80 npm start`;

// 3. Run Concurrently
const { result } = concurrently(
    [
        { command: backendCommand, name: 'BACKEND', prefixColor: 'blue' },
        { command: frontendCommand, name: 'FRONTEND', prefixColor: 'green' }
    ],
    {
        prefix: 'name',
        killOthers: ['failure', 'success'],
        restartTries: 0,
    }
);

result.then(
    () => console.log('All processes stopped'),
    (err) => console.error('Error occurred:', err)
);
