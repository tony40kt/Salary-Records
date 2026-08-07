import type { Record } from '../types/record';

export const SEMI_PROCESSED_RATE = 1.5;
export const DOUBLE_SHIFT_RATE = 2;

export function calculateRecordSalary(record: Pick<
  Record,
  | 'transportFee'
  | 'regularHours'
  | 'semiProcessedHours'
  | 'doubleShiftHours'
  | 'hourlyWage'
>): number {
  const regularPay = record.regularHours * record.hourlyWage;
  const semiProcessedPay =
    record.semiProcessedHours * record.hourlyWage * SEMI_PROCESSED_RATE;
  const doubleShiftPay =
    record.doubleShiftHours * record.hourlyWage * DOUBLE_SHIFT_RATE;

  return regularPay + semiProcessedPay + doubleShiftPay + record.transportFee;
}

export function calculateTotalHours(record: Pick<
  Record,
  'regularHours' | 'semiProcessedHours' | 'doubleShiftHours'
>): number {
  return (
    record.regularHours + record.semiProcessedHours + record.doubleShiftHours
  );
}

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatHours(value: number): string {
  return `${value.toFixed(2)} 小時`;
}