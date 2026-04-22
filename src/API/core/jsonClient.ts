// Shared fetch wrapper that keeps JSON parsing, HTTP error handling, and optional schema
// validation consistent across the app. If many API calls fail the same way, debug here first.
import type { ZodSchema } from 'zod';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type JsonRequestOptions<T> = {
  url: string;
  init?: RequestInit;
  schema?: ZodSchema<T>;
};

export const requestJson = async <T>({ url, init, schema }: JsonRequestOptions<T>) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  const data: unknown = await response.json();
  return schema ? schema.parse(data) : (data as T);
};
