import { calculateMonthlyPayment } from './utils';

describe('calculateMonthlyPayment', () => {
  describe('with positive interest rate', () => {
    it('should apply the standard annuity formula', () => {
      // 100 000 loan, 5% annual rate, 10 years
      const monthlyRate = 0.05 / 12;
      const months = 120;
      const result = calculateMonthlyPayment(100_000, monthlyRate, months);
      expect(result).toBeCloseTo(1060.66, 1);
    });

    it('should return 0 for a zero credit amount', () => {
      const result = calculateMonthlyPayment(0, 0.05 / 12, 120);
      expect(result).toBe(0);
    });

    it('should scale linearly with credit amount', () => {
      const monthlyRate = 0.06 / 12;
      const months = 60;
      const single = calculateMonthlyPayment(50_000, monthlyRate, months);
      const double = calculateMonthlyPayment(100_000, monthlyRate, months);
      expect(double).toBeCloseTo(single * 2, 5);
    });
  });

  describe('with zero interest rate', () => {
    it('should return credit divided by number of months', () => {
      const result = calculateMonthlyPayment(60_000, 0, 60);
      expect(result).toBe(1000);
    });

    it('should return 0 for zero credit at zero rate', () => {
      const result = calculateMonthlyPayment(0, 0, 120);
      expect(result).toBe(0);
    });
  });
});
