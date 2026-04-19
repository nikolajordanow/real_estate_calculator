import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoanCalculatorComponent } from './loan-calculator.component';

// Scenario A (positive rate):  100 000 loan, 10 years, 5% annual rate
//   monthlyRate        = 0.05 / 12  ≈ 0.004 167
//   numberOfPayments   = 120
//   monthlyPayment     ≈ 1 060.66
//   totalPayment       ≈ 127 279.20
//
// Scenario B (zero rate):  60 000 loan, 5 years, 0% annual rate
//   monthlyPayment     = 60 000 / 60 = 1 000
//   totalPayment       = 60 000.00

describe('LoanCalculatorComponent', () => {
  let component: LoanCalculatorComponent;
  let fixture: ComponentFixture<LoanCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCalculatorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateResults — with positive interest rate', () => {
    beforeEach(() => {
      component.loanCalculatorInputProperties[0].value = 100_000; // loanAmount
      component.loanCalculatorInputProperties[1].value = 10;      // loanTerm (years)
      component.loanCalculatorInputProperties[2].value = 5;       // annualInterestRate %
    });

    it('should calculate monthly payment', () => {
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[0].value).toBeCloseTo(1060.66, 1);
    });

    it('should calculate total payment as monthly payment × number of payments', () => {
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[1].value).toBeCloseTo(127_279, 0);
    });

    it('should scale monthly payment proportionally with loan amount', () => {
      component.calculateResults();
      const base = component.loanCalculatorOutputProperties[0].value!;

      component.loanCalculatorInputProperties[0].value = 200_000;
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[0].value).toBeCloseTo(base * 2, 2);
    });

    it('should increase monthly payment when loan term decreases', () => {
      component.calculateResults();
      const longTermPayment = component.loanCalculatorOutputProperties[0].value!;

      component.loanCalculatorInputProperties[1].value = 5; // shorter term
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[0].value!).toBeGreaterThan(longTermPayment);
    });
  });

  describe('calculateResults — with zero interest rate', () => {
    beforeEach(() => {
      component.loanCalculatorInputProperties[0].value = 60_000; // loanAmount
      component.loanCalculatorInputProperties[1].value = 5;      // loanTerm (years)
      component.loanCalculatorInputProperties[2].value = 0;      // 0% rate
    });

    it('should calculate monthly payment as simple division', () => {
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[0].value).toBe(1_000);
    });

    it('should calculate total payment equal to the original loan amount', () => {
      component.calculateResults();
      expect(component.loanCalculatorOutputProperties[1].value).toBe(60_000);
    });
  });
});
