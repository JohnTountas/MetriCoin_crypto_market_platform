import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const runProcess = (args) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      process.exit(code ?? 1);
    }
  });

  return child;
};

// Playwright only needs a tiny runtime stack: the static preview server
// for the app and the ops server that serves telemetry and notifications.
const processes = [
  runProcess(['run', 'server']),
  runProcess(['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173']),
];

const shutdown = () => {
  processes.forEach((child) => child.kill());
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
