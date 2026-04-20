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

// This helper keeps the stack dependency-light while still giving the repo
// a one-command developer experience for the frontend and the ops server.
const processes = [
  runProcess(['run', 'server:dev']),
  runProcess(['run', 'dev']),
];

const shutdown = () => {
  processes.forEach((child) => child.kill());
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
