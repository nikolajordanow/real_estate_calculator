import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculatorComponent } from "../calculator/calculator.component";
import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';
import { ConstantsService } from '../../../shared/services/constants.service';
import { EUR_TO_BGN } from '../../../shared/consts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'flip-calculator',
  templateUrl: './flip-calculator.component.html',
  styleUrl: './flip-calculator.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalculatorComponent,
  ]
})
export class FlipCalculatorComponent implements OnInit, OnDestroy {
  private _constantsSub!: Subscription;

  public flipCalculatorInputProperties: CalculatorInputModel[] = [
    { placeholder: 0, label: 'purchase_price', value: null },
    { placeholder: 0, label: 'repair_costs', value: null },
    { placeholder: 0, label: 'sale_price', value: null },
    { placeholder: 0, label: 'profit_tax', value: null }
  ];

  public flipCalculatorOutputProperties: CalculatorResultModel[] = [
    { label: 'taxes', placeholder: null, value: null },
    { label: 'total_cost', placeholder: null, value: null },
    { label: 'profit_tax', placeholder: null, value: null },
    { label: 'commission', placeholder: null, value: null },
    { label: 'profit_eur', placeholder: null, value: null },
    { label: 'profit_bgn', placeholder: null, value: null }
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

  public ngOnDestroy(): void {
    if (this._constantsSub) {
      this._constantsSub.unsubscribe();
    }
  }

  public calculateResults(): void {
    const { taxesPercent, saleCommissionPercent } = this._constantsService.getState();
    const [purchasePriceInput, repairCostsInput, salePriceInput, profitTaxInput] = this.flipCalculatorInputProperties;

    const purchasePrice = purchasePriceInput.value ?? 0;
    const repairCosts = repairCostsInput.value ?? 0;
    const salePrice = salePriceInput.value ?? 0;
    const profitTax = profitTaxInput.value ?? 0;

    // taxes
    const taxes = purchasePrice * (taxesPercent / 100);
    this.flipCalculatorOutputProperties[0].value = taxes;

    // total cost
    const totalCost = purchasePrice + repairCosts + taxes;
    this.flipCalculatorOutputProperties[1].value = totalCost;

    // commission
    const commission = salePrice * (saleCommissionPercent / 100);
    this.flipCalculatorOutputProperties[3].value = commission;

    // credit (purchase + repair + taxes)
    const credit = totalCost;

    // repayment fee (1% of credit)
    const repaymentFee = credit * 0.01;

    // gross profit
    const grossProfit = salePrice - repaymentFee - totalCost - commission;

    // net profit EUR
    const netProfitEUR = grossProfit - profitTax;
    this.flipCalculatorOutputProperties[4].value = netProfitEUR;

    // net profit BGN
    const netProfitBGN = netProfitEUR * EUR_TO_BGN;
    this.flipCalculatorOutputProperties[5].value = netProfitBGN;

    // profit tax (already input by user)
    this.flipCalculatorOutputProperties[2].value = profitTax;
  }
}