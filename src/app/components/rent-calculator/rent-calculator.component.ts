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
    { placeholder: 0, label: 'apr_percent', value: null },
    { placeholder: 0, label: 'loan_years', value: null },
    { placeholder: 0, label: 'square_meters', value: null },
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
    const taxesPercent = this._constantsService.getState()?.taxesPercent;

    const purchase = this.rentCalculatorInputProperties[0].value ?? 0;
    const repair = this.rentCalculatorInputProperties[1].value ?? 0;
    const apr = this.rentCalculatorInputProperties[2].value ?? 0;
    const years = this.rentCalculatorInputProperties[3].value ?? 0;
    const squareMeters = this.rentCalculatorInputProperties[4].value ?? 0;
    const downPayment = this.rentCalculatorInputProperties[5].value ?? 0;

    const purchaseCosts = purchase * (1 + taxesPercent / 100);
    const credit = purchaseCosts + repair - downPayment;
    const monthlyRate = (apr / 100) / 12;
    const months = years * 12;
    const monthlyPayment = calculateMonthlyPayment(credit, monthlyRate, months); 
    const evaluation = (credit / 0.85) / squareMeters;

    this.rentCalculatorOutputProperties[0].value = purchaseCosts;
    this.rentCalculatorOutputProperties[1].value = credit;
    this.rentCalculatorOutputProperties[2].value = monthlyPayment;
    this.rentCalculatorOutputProperties[3].value = evaluation;
  }
}
