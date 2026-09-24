import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { calculateMonthlyPayment } from '../../../shared/utils';
import { CalculatorComponent } from "../calculator/calculator.component";
import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';

@Component({
  selector: 'loan-calculator',
  templateUrl: './loan-calculator.component.html',
  styleUrl: './loan-calculator.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalculatorComponent
  ]
})
export class LoanCalculatorComponent {
  public loanCalculatorInputProperties: CalculatorInputModel[] = [
    { placeholder: 0, label: 'loan_amount', value: null },
    { placeholder: 0, label: 'loan_term', value: null, showPrefix: false },
    { placeholder: 0, label: 'annual_interest_rate', value: null, showPrefix: false }
  ];

  public loanCalculatorOutputProperties: CalculatorResultModel[] = [
    { label: 'monthly_payment', placeholder: null, value: null },
    { label: 'total_payment', placeholder: null, value: null }
  ];

  public calculateResults(): void {
    const [loanAmountInput, loanTermInput, annualRateInput] = this.loanCalculatorInputProperties;
    const [monthlyPaymentOutput, totalPaymentOutput] = this.loanCalculatorOutputProperties;

    const monthlyRate = (annualRateInput.value ?? 0) / 100 / 12;
    const numberOfPayments = (loanTermInput.value ?? 0) * 12;
    const monthlyPayment = calculateMonthlyPayment(loanAmountInput.value ?? 0, monthlyRate, numberOfPayments);

    monthlyPaymentOutput.value = monthlyPayment;
    totalPaymentOutput.value = Number((monthlyPayment * numberOfPayments).toFixed(2));
  }
}
