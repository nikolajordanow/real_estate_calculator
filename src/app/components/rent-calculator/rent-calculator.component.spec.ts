import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { RentCalculatorComponent } from './rent-calculator.component';
import { ConstantsService } from '../../../shared/services/constants.service';

// Inputs:  purchase=100000, repair=5000, apr=5%, years=20, sqm=80, downPayment=20000
// Default: taxesPercent=7%
//
// purchaseCosts = 100000 * 1.07          = 107 000
// credit        = 107000 + 5000 - 20000  = 92 000
// monthlyRate   = 5/100/12               ≈ 0.004 167
// months        = 20 * 12               = 240
// monthlyPayment≈ 607.25  (standard annuity formula)
// evaluation    = (92000 / 0.85) / 80   ≈ 1 352.94

describe('RentCalculatorComponent', () => {
  let component: RentCalculatorComponent;
  let fixture: ComponentFixture<RentCalculatorComponent>;
  let constantsService: ConstantsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentCalculatorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RentCalculatorComponent);
    component = fixture.componentInstance;
    constantsService = TestBed.inject(ConstantsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateResults', () => {
    beforeEach(() => {
      component.rentCalculatorInputProperties[0].value = 100_000; // purchase
      component.rentCalculatorInputProperties[1].value = 5_000;   // repair
      component.rentCalculatorInputProperties[2].value = 5;       // apr %
      component.rentCalculatorInputProperties[3].value = 20;      // years
      component.rentCalculatorInputProperties[4].value = 80;      // sqm
      component.rentCalculatorInputProperties[5].value = 20_000;  // downPayment
    });

    it('should calculate purchase costs as purchase price including taxes', () => {
      component.calculateResults();
      expect(component.rentCalculatorOutputProperties[0].value).toBe(107_000);
    });

    it('should calculate credit as purchase costs + repair - down payment', () => {
      component.calculateResults();
      expect(component.rentCalculatorOutputProperties[1].value).toBe(92_000);
    });

    it('should calculate monthly payment using the annuity formula', () => {
      component.calculateResults();
      // Expected ≈ 607.25 for 92 000 at 5% APR over 20 years
      expect(component.rentCalculatorOutputProperties[2].value).toBeCloseTo(607.25, 0);
    });

    it('should calculate monthly payment as simple division at 0% APR', () => {
      component.rentCalculatorInputProperties[2].value = 0; // apr = 0
      component.calculateResults();
      // credit = 92000, months = 240 → 92000/240 ≈ 383.33
      expect(component.rentCalculatorOutputProperties[2].value).toBeCloseTo(92_000 / 240, 5);
    });

    it('should calculate evaluation per square metre', () => {
      component.calculateResults();
      // (92000 / 0.85) / 80 ≈ 1352.94
      expect(component.rentCalculatorOutputProperties[3].value).toBeCloseTo(1352.94, 1);
    });

    it('should treat null inputs as zero', () => {
      for (const input of component.rentCalculatorInputProperties) {
        input.value = null;
      }
      component.calculateResults();
      expect(component.rentCalculatorOutputProperties[0].value).toBe(0); // purchaseCosts
      expect(component.rentCalculatorOutputProperties[1].value).toBe(0); // credit
    });

    it('should recalculate purchase costs when taxesPercent changes', () => {
      component.calculateResults();
      // Increase taxes from 7% to 14%
      constantsService.updateState({ taxesPercent: 14 });
      // purchaseCosts = 100000 * 1.14 = 114 000
      expect(component.rentCalculatorOutputProperties[0].value).toBeCloseTo(114_000, 2);
    });

    it('should increase credit when down payment decreases', () => {
      component.calculateResults();
      const initialCredit = component.rentCalculatorOutputProperties[1].value!;

      component.rentCalculatorInputProperties[5].value = 10_000; // lower down payment
      component.calculateResults();
      expect(component.rentCalculatorOutputProperties[1].value!).toBeGreaterThan(initialCredit);
    });
  });
});
