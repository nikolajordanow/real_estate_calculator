import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { VatFlipDeedCalculatorComponent } from './vat-flip-deed-calculator.component';
import { ConstantsService } from '../../../shared/services/constants.service';

// Example (taxesPercent=7%, saleCommissionPercent=2%, purchase includes VAT):
//
// purchaseDeedGross = 100 000 → purchaseTaxBase = 83 333.33, purchaseVat = 16 666.67
// purchaseActual    = 120 000
// saleDeedGross     = 250 000 → saleTaxBase = 208 333.33,    saleVat = 41 666.67
// saleActual        = 280 000
// renovationGross   = 40 000  → renovationNet = 33 333.33,   renovationVat = 6 666.67
//
// vatDue             = 41 666.67 - 16 666.67 - 6 666.67     = 18 333.33
// localTaxesAndFees  = 83 333.33 * 0.07                     =  5 833.33
// commission         = 208 333.33 * 0.02                    =  4 166.67
//
// taxableProfit      = 208 333.33 - 83 333.33 - 33 333.33 - 4 166.67 - 5 833.33 = 81 666.67
// corporateTax       = 81 666.67 * 0.10                     =  8 166.67
//
// realProfitBeforeTax = 280 000 - 120 000 - 40 000 - 18 333.33 - 4 166.67 - 5 833.33 = 91 666.67
// realProfit          = 91 666.67 - 8 166.67                = 83 500.00
// totalRealInvestment = 120 000 - 16 666.67 + 33 333.33 + 5 833.33 = 142 500.00
// grossProfitPercent  = 91 666.67 / 142 500 * 100           = 64.33

describe('VatFlipDeedCalculatorComponent', () => {
  let component: VatFlipDeedCalculatorComponent;
  let fixture: ComponentFixture<VatFlipDeedCalculatorComponent>;
  let constantsService: ConstantsService;

  const setInputs = (
    purchaseDeed: number | null,
    purchaseActual: number | null,
    saleDeed: number | null,
    saleActual: number | null,
    renovation: number | null
  ) => {
    const inputs = component.vatFlipDeedCalculatorInputProperties;
    inputs[0].value = purchaseDeed;
    inputs[1].value = purchaseActual;
    inputs[2].value = saleDeed;
    inputs[3].value = saleActual;
    inputs[4].value = renovation;
  };

  const output = (index: number) => component.vatFlipDeedCalculatorOutputProperties[index].value;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VatFlipDeedCalculatorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VatFlipDeedCalculatorComponent);
    component = fixture.componentInstance;
    constantsService = TestBed.inject(ConstantsService);
    constantsService.updateState({ taxesPercent: 7, saleCommissionPercent: 2 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateResults — deed and actual prices differ', () => {
    beforeEach(() => {
      setInputs(100_000, 120_000, 250_000, 280_000, 40_000);
      component.calculateResults();
    });

    it('should calculate VAT from deed prices', () => {
      expect(output(0)).toBeCloseTo(16_666.67, 2); // purchaseVat
      expect(output(1)).toBeCloseTo(6_666.67, 2);  // renovationVat
      expect(output(2)).toBeCloseTo(41_666.67, 2); // saleVat
      expect(output(3)).toBeCloseTo(18_333.33, 2); // vatDue
    });

    it('should calculate local taxes on the purchase tax base (83333.33 * 7% = 5833.33)', () => {
      expect(output(4)).toBeCloseTo(5_833.33, 2);
    });

    it('should calculate commission on the sale tax base (208333.33 * 2% = 4166.67)', () => {
      expect(output(5)).toBeCloseTo(4_166.67, 2);
    });

    it('should calculate taxable profit and corporate tax from deed prices only', () => {
      expect(output(6)).toBeCloseTo(81_666.67, 2);
      expect(output(7)).toBeCloseTo(8_166.67, 2);
    });

    it('should calculate real profit from actual prices = 83500.00', () => {
      expect(output(8)).toBeCloseTo(83_500.00, 2);
    });

    it('should calculate gross profit % on real investment = 64.33', () => {
      expect(output(9)).toBeCloseTo(64.33, 2);
    });

    it('actual prices must NOT affect statutory values', () => {
      const statutory = [0, 1, 2, 3, 4, 5, 6, 7].map(output);
      setInputs(100_000, 150_000, 250_000, 400_000, 40_000);
      component.calculateResults();
      expect([0, 1, 2, 3, 4, 5, 6, 7].map(output)).toEqual(statutory);
    });
  });

  describe('calculateResults — matches vat-flip-calculator when actual = deed', () => {
    it('should give the same profit as vat-flip-calculator (73500.00) with VAT on purchase', () => {
      setInputs(100_000, 100_000, 250_000, 250_000, 40_000);
      component.calculateResults();
      expect(output(7)).toBeCloseTo(8_166.67, 2);
      expect(output(8)).toBeCloseTo(73_500.00, 2);
      // 81666.67 / (83333.33 + 33333.33 + 5833.33) * 100
      expect(output(9)).toBeCloseTo(66.67, 2);
    });

    it('should fall back to deed prices when actual prices are empty', () => {
      setInputs(100_000, null, 250_000, null, 40_000);
      component.calculateResults();
      expect(output(8)).toBeCloseTo(73_500.00, 2);
    });
  });

  describe('calculateResults — purchase without VAT', () => {
    beforeEach(() => {
      component.purchaseIncludesVat = false;
      setInputs(100_000, 100_000, 250_000, 250_000, 40_000);
      component.onPurchaseIncludesVatChange();
    });

    it('should switch the purchase deed label', () => {
      expect(component.vatFlipDeedCalculatorInputProperties[0].label).toBe('purchase_price_deed');
    });

    it('should not deduct purchase VAT', () => {
      expect(output(0)).toBe(0);
      expect(output(3)).toBeCloseTo(35_000.00, 2); // vatDue = 41666.67 - 6666.67
    });

    it('should use the full deed price as purchase tax base', () => {
      expect(output(4)).toBeCloseTo(7_000.00, 2);  // 100000 * 7%
      expect(output(6)).toBeCloseTo(63_833.33, 2); // taxable profit
      expect(output(7)).toBeCloseTo(6_383.33, 2);  // corporate tax
      expect(output(8)).toBeCloseTo(57_450.00, 2); // real profit
    });
  });

  describe('calculateResults — edge cases', () => {
    it('should treat null inputs as zero', () => {
      setInputs(null, null, null, null, null);
      component.calculateResults();
      expect(output(0)).toBe(0);
      expect(output(8)).toBe(0);
      expect(output(9)).toBe(0);
    });

    it('should set corporateTax to 0 when taxable profit is negative, even if real profit is positive', () => {
      setInputs(300_000, 300_000, 100_000, 500_000, 60_000);
      component.calculateResults();
      expect(output(6)).toBeLessThan(0);
      expect(output(7)).toBe(0);
      expect(output(8)).toBeGreaterThan(0);
    });

    it('should recalculate when taxesPercent changes', () => {
      setInputs(100_000, 120_000, 250_000, 280_000, 40_000);
      constantsService.updateState({ taxesPercent: 10 });
      // localTaxesAndFees = 83333.33 * 10% = 8333.33
      expect(output(4)).toBeCloseTo(8_333.33, 2);
    });
  });
});
