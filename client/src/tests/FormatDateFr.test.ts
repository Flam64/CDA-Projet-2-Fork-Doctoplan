import { it, expect, describe } from 'vitest';
import { formatDate } from '@/utils/formatDateFr';

describe('formatDate', () => {
  it('the conversion from yyyy-mm-dd to dd-mm-yyyy format is correct', () => {
    //const inputDate = '2025-06-17';
    const result = formatDate('2025-06-17');
    expect(result).toBe('17/06/2025');
  });

  it('should return an empty string if the date is empty', () => {
    const emptyDate = '';
    const result = formatDate(emptyDate);
    expect(result).toBe('');
  });

  it('should manage the entry properly with a single digit of days and months', () => {
    const singleDigitMonthsAndDays = '2025/1/7';
    const result = formatDate(singleDigitMonthsAndDays);
    expect(result).toBe('07/01/2025');
  });

  it('should properly manage a bissextile year date', () => {
    const bissextileYear = '2028/02/29';
    const result = formatDate(bissextileYear);
    expect(result).toBe('29/02/2028');
  });

  it('should correctly return the current date', () => {
    const dateNow = Date(); // 👉 for exemple: Tue Jun 17 2025 17:08:58 GMT+0200 (heure d’été d’Europe centrale)'
    const result = formatDate(dateNow);
    const dateNowToTest = new Date().toLocaleDateString('fr'); // 👉 for exemple: 17/06/2025
    expect(result).toBe(dateNowToTest);
  });
});
