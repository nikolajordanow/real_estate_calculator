import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { calculateMonthlyPayment } from '../../../shared/utils';
import { CalculatorComponent } from "../calculator/calculator.component";
import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';
import { ConstantsService } from '../../../shared/services/constants.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rent-calculator',
  templateUrl: './rent-calculator.component.html',
  styleUrl: './rent-calculator.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CalculatorComponent
  ]
})
export class RentCalculatorComponent implements OnInit, OnDestroy {
  private _constantsSub!: Subscription;

  public rentCalculatorInputProperties: CalculatorInputModel[] = [
    { placeholder: 0, label: 'purchase_price', value: null },
    { placeholder: 0, label: 'repair_costs', value: null },
    { placeholder: 0, label: 'apr_percent', value: null, showPrefix: false },
    { placeholder: 0, label: 'loan_years', value: null, showPrefix: false },
    { placeholder: 0, label: 'square_meters', value: null, showPrefix: false },
    { placeholder: 0, label: 'down_payment', value: null }
  ];

  public rentCalculatorOutputProperties: CalculatorResultModel[] = [
    { label: 'purchase_costs', placeholder: null, value: null },
    { label: 'credit', placeholder: null, value: null },
    { label: 'monthly_payment', placeholder: null, value: null },
    { label: 'evaluation', placeholder: null, value: null, extention: 'square_meters_extension' }
  ];

  constructor(
    private readonly _constantsService: ConstantsService
  ) { }

  public ngOnInit(): void {
    this._constantsSub = this._constantsService.state$
      .subscribe(() => {
        this.calculateResults();
      });
  }

  public ngOnDestroy() {
    if (this._constantsSub) {
      this._constantsSub.unsubscribe();
    }
  }

  public calculateResults(): void {
    const { taxesPercent } = this._constantsService.getState();
    const [purchaseInput, repairInput, aprInput, yearsInput, squareMetersInput, downPaymentInput] = this.rentCalculatorInputProperties;
    const [purchaseCostsOutput, creditOutput, monthlyPaymentOutput, evaluationOutput] = this.rentCalculatorOutputProperties;

    const purchase = purchaseInput.value ?? 0;
    const repair = repairInput.value ?? 0;
    const apr = aprInput.value ?? 0;
    const years = yearsInput.value ?? 0;
    const squareMeters = squareMetersInput.value ?? 0;
    const downPayment = downPaymentInput.value ?? 0;

    const purchaseCosts = purchase * (1 + taxesPercent / 100);
    const credit = purchaseCosts + repair - downPayment;
    const monthlyRate = (apr / 100) / 12;
    const months = years * 12;
    const monthlyPayment = calculateMonthlyPayment(credit, monthlyRate, months);
    const evaluation = (credit / 0.85) / squareMeters;

    purchaseCostsOutput.value = purchaseCosts;
    creditOutput.value = credit;
    monthlyPaymentOutput.value = monthlyPayment;
    evaluationOutput.value = evaluation;
  }
}
