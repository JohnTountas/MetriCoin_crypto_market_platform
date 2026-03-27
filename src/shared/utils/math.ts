import Decimal from 'decimal.js';

export const toDecimal = (value: Decimal.Value) => new Decimal(value);

export const toNumber = (value: Decimal.Value, precision = 8) =>
  Number(new Decimal(value).toDecimalPlaces(precision, Decimal.ROUND_HALF_UP).toString());

export const percentageOf = (part: Decimal.Value, total: Decimal.Value) => {
  const denominator = new Decimal(total);
  if (denominator.isZero()) return 0;

  return toNumber(new Decimal(part).div(denominator).mul(100));
};

export const sumNumbers = (values: number[]) =>
  values.reduce((accumulator, value) => accumulator.plus(value), new Decimal(0));

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const roundCurrency = (value: number) => toNumber(value, 2);

