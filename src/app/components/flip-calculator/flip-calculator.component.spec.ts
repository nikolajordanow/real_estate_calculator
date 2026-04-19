import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FlipCalculatorComponent } from './flip-calculator.component';
import { ConstantsService } from '../../../shared/services/constants.service';
import { EUR_TO_BGN } from '../../../shared/consts';

// Inputs:  purchasePrice=100000, repairCosts=10000, salePrice=150000, profitTax=2000
// Default: taxesPercent=7%, saleCommissionPercent=2%
//
// taxes         = 100000 * 0.07          = 7 000
// totalCost     = 100000 + 10000 + 7000  = 117 000
// commission    = 150000 * 0.02          = 3 000
// repaymentFee  = 117000 * 0.01          = 1 170
// grossProfit   = 150000 - 1170 - 117000 - 3000 = 28 830
// netProfitEUR  = 28830 - 2000           = 26 830
// netProfitBGN  = 26830 * EUR_TO_BGN

describe('FlipCalculatorComponent', () => {
  let component: FlipCalculatorComponent;
  let fixture: ComponentFixture<FlipCalculatorComponent>;
  let constantsService: ConstantsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlipCalculatorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlipCalculatorComponent);
    component = fixture.componentInstance;
    constantsService = TestBed.inject(ConstantsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateResults', () => {
    beforeEach(() => {
      component.flipCalculatorInputProperties[0].value = 100_000; // purchasePrice
      component.flipCalculatorInputProperties[1].value = 10_000;  // repairCosts
      component.flipCalculatorInputProperties[2].value = 150_000; // salePrice
      component.flipCalculatorInputProperties[3].value = 2_000;   // profitTax
    });

    it('should calculate taxes as taxesPercent% of purchase price', () => {
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[0].value).toBeCloseTo(7_000, 2);
    });

    it('should calculate total cost as purchase price + repair costs + taxes', () => {
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[1].value).toBeCloseTo(117_000, 2);
    });

    it('should store the profit tax input as-is in the output', () => {
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[2].value).toBe(2_000);
    });

    it('should calculate commission as saleCommissionPercent% of sale price', () => {
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[3].value).toBeCloseTo(3_000, 2);
    });

    it('should calculate net profit in EUR', () => {
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[4].value).toBeCloseTo(26_830, 2);
    });

    it('should calculate net profit in BGN', () => {
      component.calculateResults();
      const expectedBGN = 26_830 * EUR_TO_BGN;
      expect(component.flipCalculatorOutputProperties[5].value).toBeCloseTo(expectedBGN, 5);
    });

    it('should yield a negative profit when sale price is below total costs', () => {
      component.flipCalculatorInputProperties[2].value = 100_000; // salePrice below totalCost
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[4].value).toBeLessThan(0);
    });

    it('should treat null inputs as zero', () => {
      component.flipCalculatorInputProperties[0].value = null;
      component.flipCalculatorInputProperties[1].value = null;
      component.flipCalculatorInputProperties[2].value = null;
      component.flipCalculatorInputProperties[3].value = null;
      component.calculateResults();
      expect(component.flipCalculatorOutputProperties[0].value).toBe(0); // taxes
      expect(component.flipCalculatorOutputProperties[1].value).toBe(0); // totalCost
      expect(component.flipCalculatorOutputProperties[4].value).toBe(0); // netProfitEUR
      expect(component.flipCalculatorOutputProperties[5].value).toBe(0); // netProfitBGN
    });

    it('should recalculate taxes when taxesPercent changes', () => {
      component.calculateResults();
      // Change taxes from 7% to 10%
      constantsService.updateState({ taxesPercent: 10 });
      // Subscription triggers calculateResults() automatically
      expect(component.flipCalculatorOutputProperties[0].value).toBe(10_000);
    });

    it('should recalculate commission when saleCommissionPercent changes', () => {
      component.calculateResults();
      // Change commission from 2% to 3%
      constantsService.updateState({ saleCommissionPercent: 3 });
      expect(component.flipCalculatorOutputProperties[3].value).toBe(4_500);
    });
  });
});
