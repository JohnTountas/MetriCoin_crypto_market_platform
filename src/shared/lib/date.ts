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

