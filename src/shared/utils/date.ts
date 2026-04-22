// Central date formatting helpers keep timestamps readable and consistent across the UI.
// If display rules change later, one edit here can update every surface that depends on them.
export const formatLocalDateTime = (value: string | number) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);

export const formatShortTime = (value: string | number) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);

export const toIsoNow = () => new Date().toISOString();
