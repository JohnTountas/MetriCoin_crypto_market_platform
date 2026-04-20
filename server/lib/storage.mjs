import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultServerState, serverStateSchema } from './schemas.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(__dirname, '../data');
const stateFilePath = path.join(dataDirectory, 'runtime-state.json');

// The ops server deliberately uses a simple JSON store so the project keeps a
// tiny local backend footprint while still demonstrating persistence patterns.
const mergeWithDefaults = (state) => ({
  ...defaultServerState,
  ...state,
  notificationSettings: {
    ...defaultServerState.notificationSettings,
    ...state.notificationSettings,
  },
  alertStatuses: state.alertStatuses ?? {},
  notifications: state.notifications ?? [],
  syncedAlerts: state.syncedAlerts ?? [],
  telemetry: state.telemetry ?? [],
});

export const ensureStorageReady = async () => {
  await mkdir(dataDirectory, { recursive: true });
};

export const readServerState = async () => {
  await ensureStorageReady();

  try {
    const raw = await readFile(stateFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return serverStateSchema.parse(mergeWithDefaults(parsed));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      await writeServerState(defaultServerState);
      return defaultServerState;
    }

    throw error;
  }
};

export const writeServerState = async (state) => {
  await ensureStorageReady();

  const normalizedState = serverStateSchema.parse(mergeWithDefaults(state));
  await writeFile(stateFilePath, `${JSON.stringify(normalizedState, null, 2)}\n`, 'utf8');
  return normalizedState;
};

export const updateServerState = async (updater) => {
  const currentState = await readServerState();
  const nextState = await updater(currentState);
  return writeServerState(nextState);
};
