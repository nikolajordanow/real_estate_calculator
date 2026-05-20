import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { VatFlipCalculatorComponent } from './vat-flip-calculator.component';
import { ConstantsService } from '../../../shared/services/constants.service';

// Example (taxesPercent=7%, saleCommissionPercent=2%):
//
// purchaseGross = 100 000  → purchaseNet = 83 333.33,  purchaseVat = 16 666.67
// renovationGross = 40 000 → renovationNet = 33 333.33, renovationVat = 6 666.67
// saleGross = 250 000      → saleNet = 208 333.33,     saleVat = 41 666.67
//
// vatDue             = 41 666.67 - 16 666.67 - 6 666.67 = 18 333.33
// localTaxesAndFees  = 83 333.33 * 0.07                 =  5 833.33
// commission         = 208 333.33 * 0.02                =  4 166.67
//
// profitBeforeTax    = 208 333.33 - 83 333.33 - 33 333.33 - 4 166.67 - 5 833.33 = 81 666.67
// corporateTax       = 81 666.67 * 0.10                 =  8 166.67
// finalProfit        = 81 666.67 - 8 166.67             = 73 500.00

describe('VatFlipCalculatorComponent', () => {
  let component: VatFlipCalculatorComponent;
  let fixture: ComponentFixture<VatFlipCalculatorComponent>;
  let constantsService: ConstantsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VatFlipCalculatorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VatFlipCalculatorComponent);
    component = fixture.componentInstance;
    constantsService = TestBed.inject(ConstantsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateResults — example scenario', () => {
    beforeEach(() => {
      component.vatFlipCalculatorInputProperties[0].value = 100_000; // purchaseGross
      component.vatFlipCalculatorInputProperties[1].value = 40_000;  // renovationGross
      component.vatFlipCalculatorInputProperties[2].value = 250_000; // saleGross
      component.calculateResults();
    });

    it('should extract VAT on purchase (100000 / 6 = 16666.67)', () => {
      expect(component.vatFlipCalculatorOutputProperties[0].value).toBeCloseTo(16_666.67, 2);
    });

    it('should extract VAT on renovation (40000 / 6 = 6666.67)', () => {
      expect(component.vatFlipCalculatorOutputProperties[1].value).toBeCloseTo(6_666.67, 2);
    });

    it('should extract VAT on sale (250000 / 6 = 41666.67)', () => {
      expect(component.vatFlipCalculatorOutputProperties[2].value).toBeCloseTo(41_666.67, 2);
    });

    it('should calculate vatDue = saleVat - purchaseVat - renovationVat = 18333.33', () => {
      expect(component.vatFlipCalculatorOutputProperties[3].value).toBeCloseTo(18_333.33, 2);
    });

    it('should calculate local taxes on net purchase price (83333.33 * 7% = 5833.33)', () => {
      expect(component.vatFlipCalculatorOutputProperties[4].value).toBeCloseTo(5_833.33, 2);
    });

    it('should calculate commission on net sale price (208333.33 * 2% = 4166.67)', () => {
      expect(component.vatFlipCalculatorOutputProperties[5].value).toBeCloseTo(4_166.67, 2);
    });

    it('should calculate corporate tax as 10% of profit before tax (8166.67)', () => {
      expect(component.vatFlipCalculatorOutputProperties[6].value).toBeCloseTo(8_166.67, 2);
    });

    it('should calculate final profit after corporate tax = 73500.00', () => {
      expect(component.vatFlipCalculatorOutputProperties[7].value).toBeCloseTo(73_500.00, 2);
    });

    it('vatDue must NOT reduce the profit (profit uses only net values)', () => {
      // profitBeforeTax = saleNet - purchaseNet - renovationNet - commission - taxes
      // = 208333.33 - 83333.33 - 33333.33 - 4166.67 - 5833.33 = 81666.67
      const profitBeforeTax = 81_666.67;
      const corporateTax = component.vatFlipCalculatorOutputProperties[6].value!;
      const finalProfit = component.vatFlipCalculatorOutputProperties[7].value!;
      expect(corporateTax + finalProfit).toBeCloseTo(profitBeforeTax, 2);
    });
  });

  describe('calculateResults — edge cases', () => {
    it('should treat null inputs as zero', () => {
      component.vatFlipCalculatorInputProperties[0].value = null;
      component.vatFlipCalculatorInputProperties[1].value = null;
      component.vatFlipCalculatorInputProperties[2].value = null;
      component.calculateResults();
      expect(component.vatFlipCalculatorOutputProperties[0].value).toBe(0); // purchaseVat
      expect(component.vatFlipCalculatorOutputProperties[7].value).toBe(0); // finalProfit
    });

    it('should set corporateTax to 0 when profit is negative', () => {
      component.vatFlipCalculatorInputProperties[0].value = 300_000; // purchaseGross
      component.vatFlipCalculatorInputProperties[1].value = 60_000;  // renovationGross
      component.vatFlipCalculatorInputProperties[2].value = 100_000; // saleGross (loss)
      component.calculateResults();
      expect(component.vatFlipCalculatorOutputProperties[6].value).toBe(0);
    });

    it('should recalculate when taxesPercent changes', () => {
      component.vatFlipCalculatorInputProperties[0].value = 100_000;
      component.vatFlipCalculatorInputProperties[1].value = 40_000;
      component.vatFlipCalculatorInputProperties[2].value = 250_000;
      constantsService.updateState({ taxesPercent: 10 });
      // localTaxesAndFees = 83333.33 * 10% = 8333.33
      expect(component.vatFlipCalculatorOutputProperties[4].value).toBeCloseTo(8_333.33, 2);
    });

    it('should recalculate when saleCommissionPercent changes', () => {
      component.vatFlipCalculatorInputProperties[0].value = 100_000;
      component.vatFlipCalculatorInputProperties[1].value = 40_000;
      component.vatFlipCalculatorInputProperties[2].value = 250_000;
      constantsService.updateState({ saleCommissionPercent: 3 });
      // commission = 208333.33 * 3% = 6250.00
      expect(component.vatFlipCalculatorOutputProperties[5].value).toBeCloseTo(6_250.00, 2);
    });
  });
});
