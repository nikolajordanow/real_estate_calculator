import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculatorComponent } from "../calculator/calculator.component";
import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';
import { ConstantsService } from '../../../shared/services/constants.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'vat-flip-calculator',
  templateUrl: './vat-flip-calculator.component.html',
  styleUrl: './vat-flip-calculator.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalculatorComponent,
  ]
})
export class VatFlipCalculatorComponent implements OnInit, OnDestroy {
  private _constantsSub!: Subscription;

  private readonly VAT_DIVISOR = 1.2;
  private readonly CORPORATE_TAX_RATE = 0.10;

  public vatFlipCalculatorInputProperties: CalculatorInputModel[] = [
    { placeholder: 0, label: 'purchase_price_vat', value: null },
    { placeholder: 0, label: 'repair_costs_vat', value: null },
    { placeholder: 0, label: 'sale_price_vat', value: null }
  ];

  public vatFlipCalculatorOutputProperties: CalculatorResultModel[] = [
    { label: 'vat_on_purchase', placeholder: null, value: null },
    { label: 'vat_on_repair', placeholder: null, value: null },
    { label: 'vat_on_sale', placeholder: null, value: null },
    { label: 'net_vat', placeholder: null, value: null },
    { label: 'taxes', placeholder: null, value: null },
    { label: 'commission', placeholder: null, value: null },
    { label: 'profit_tax', placeholder: null, value: null },
    { label: 'profit_eur', placeholder: null, value: null }
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
    const [purchasePriceInput, repairCostsInput, salePriceInput] = this.vatFlipCalculatorInputProperties;

    const purchaseGross = purchasePriceInput.value ?? 0;
    const renovationGross = repairCostsInput.value ?? 0;
    const saleGross = salePriceInput.value ?? 0;

    // Extract net values and VAT from gross (all inputs include VAT)
    const purchaseNet = purchaseGross / this.VAT_DIVISOR;
    const purchaseVat = purchaseGross - purchaseNet;
    this.vatFlipCalculatorOutputProperties[0].value = purchaseVat;

    const renovationNet = renovationGross / this.VAT_DIVISOR;
    const renovationVat = renovationGross - renovationNet;
    this.vatFlipCalculatorOutputProperties[1].value = renovationVat;

    const saleNet = saleGross / this.VAT_DIVISOR;
    const saleVat = saleGross - saleNet;
    this.vatFlipCalculatorOutputProperties[2].value = saleVat;

    // VAT due to the state (shown as liability, not an expense in profit calc)
    const vatDue = saleVat - purchaseVat - renovationVat;
    this.vatFlipCalculatorOutputProperties[3].value = vatDue;

    // Local taxes and fees on net purchase price
    const localTaxesAndFees = purchaseNet * (taxesPercent / 100);
    this.vatFlipCalculatorOutputProperties[4].value = localTaxesAndFees;

    // Commission on net sale price
    const commission = saleNet * (saleCommissionPercent / 100);
    this.vatFlipCalculatorOutputProperties[5].value = commission;

    // Profit before corporate tax (VAT is not an expense — only net values)
    const profitBeforeCorporateTax = saleNet - purchaseNet - renovationNet - commission - localTaxesAndFees;

    // Corporate tax (10%)
    const corporateTax = profitBeforeCorporateTax > 0 ? profitBeforeCorporateTax * this.CORPORATE_TAX_RATE : 0;
    this.vatFlipCalculatorOutputProperties[6].value = corporateTax;

    // Final profit after corporate tax
    const finalProfit = profitBeforeCorporateTax - corporateTax;
    this.vatFlipCalculatorOutputProperties[7].value = finalProfit;
  }
}
