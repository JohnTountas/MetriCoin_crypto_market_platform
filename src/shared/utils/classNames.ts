import { type ClassValue, clsx as combineClassNames } from 'clsx';

export const classNames = (...inputs: ClassValue[]) => combineClassNames(...inputs);
