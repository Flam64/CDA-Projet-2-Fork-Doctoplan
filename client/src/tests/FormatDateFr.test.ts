import { test, expect } from 'vitest';
import { formatDate } from '@/utils/formatDateFr';

test('formatDate should format the date correctly', () => {
  const inputDate = '2025-06-17';
  const result = formatDate(inputDate);
  expect(result).toBe('17/06/2025');
});
