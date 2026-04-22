// Small shared alias around clsx so the codebase can use one naming convention everywhere.
// Tiny utilities like this remove a surprising amount of low-value inconsistency.
import { type ClassValue, clsx as combineClassNames } from 'clsx';

export const classNames = (...inputs: ClassValue[]) => combineClassNames(...inputs);
