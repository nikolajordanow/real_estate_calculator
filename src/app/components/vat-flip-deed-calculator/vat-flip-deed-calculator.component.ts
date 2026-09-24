import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculatorComponent, FLIP_CATEGORY_ORDER } from "../calculator/calculator.component";
import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';
import { ConstantsService } from '../../../shared/services/constants.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'vat-flip-deed-calculator',
  templateUrl: './vat-flip-deed-calculator.component.html',
  styleUrl: './vat-flip-deed-calculator.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalculatorComponent,
    TranslatePipe,
    MatSlideToggleModule,
  ]
})
export class VatFlipDeedCalculatorComponent implements OnInit, OnDestroy {
  private _constantsSub!: Subscription;

  private readonly VAT_DIVISOR = 1.2;
  private readonly CORPORATE_TAX_RATE = 0.10;

  public purchaseIncludesVat = true;

  public vatFlipDeedCalculatorInputProperties: CalculatorInputModel[] = [
    { placeholder: 0, label: 'purchase_price_deed_vat', value: null },
    { placeholder: 0, label: 'purchase_price_actual', value: null },
    { placeholder: 0, label: 'sale_price_deed_vat', value: null },
    { placeholder: 0, label: 'sale_price_actual', value: null },
    { placeholder: 0, label: 'repair_costs_vat', value: null }
  ];

  public vatFlipDeedCalculatorOutputProperties: CalculatorResultModel[] = [
    { label: 'vat_on_purchase', placeholder: null, value: null, category: 'cat_vat' },
    { label: 'vat_on_repair', placeholder: null, value: null, category: 'cat_vat' },
    { label: 'vat_on_sale', placeholder: null, value: null, category: 'cat_vat' },
    { label: 'net_vat', placeholder: null, value: null, category: 'cat_vat' },
    { label: 'taxes', placeholder: null, value: null, category: 'cat_purchase' },
    { label: 'commission', placeholder: null, value: null, category: 'cat_purchase' },
    { label: 'taxable_profit', placeholder: null, value: null, category: 'cat_taxes' },
    { label: 'profit_tax', placeholder: null, value: null, category: 'cat_taxes' },
    { label: 'profit_eur', placeholder: null, value: null, category: 'cat_profit' },
    { label: 'gross_profit_percent', placeholder: null, value: null, extention: '%', category: 'cat_profit' },
  ];

  public readonly resultCategoryOrder = FLIP_CATEGORY_ORDER;

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

  public onPurchaseIncludesVatChange(): void {
    this.vatFlipDeedCalculatorInputProperties[0].label = this.purchaseIncludesVat ? 'purchase_price_deed_vat' : 'purchase_price_deed';
    this.calculateResults();
  }

  public calculateResults(): void {
    const { taxesPercent, saleCommissionPercent } = this._constantsService.getState();
    const [purchaseDeedInput, purchaseActualInput, saleDeedInput, saleActualInput, repairCostsInput] = this.vatFlipDeedCalculatorInputProperties;

    // Deed/contract prices — basis for VAT, taxes, fees, commissions and corporate tax
    const purchaseDeedGross = purchaseDeedInput.value ?? 0;
    const saleDeedGross = saleDeedInput.value ?? 0;
    const renovationGross = repairCostsInput.value ?? 0;

    // Actual prices — total amounts really paid/received; default to the deed price when empty
    const purchaseActual = purchaseActualInput.value ?? purchaseDeedGross;
    const saleActual = saleActualInput.value ?? saleDeedGross;

    // Statutory bases: net deed prices (purchase includes VAT only when selected)
    const purchaseTaxBase = this.purchaseIncludesVat ? purchaseDeedGross / this.VAT_DIVISOR : purchaseDeedGross;
    const purchaseVat = purchaseDeedGross - purchaseTaxBase;
    this.vatFlipDeedCalculatorOutputProperties[0].value = purchaseVat;

    const renovationNet = renovationGross / this.VAT_DIVISOR;
    const renovationVat = renovationGross - renovationNet;
    this.vatFlipDeedCalculatorOutputProperties[1].value = renovationVat;

    const saleTaxBase = saleDeedGross / this.VAT_DIVISOR;
    const saleVat = saleDeedGross - saleTaxBase;
    this.vatFlipDeedCalculatorOutputProperties[2].value = saleVat;

    // VAT due to the state
    const vatDue = saleVat - purchaseVat - renovationVat;
    this.vatFlipDeedCalculatorOutputProperties[3].value = vatDue;

    // Local taxes and fees on the purchase tax base
    const localTaxesAndFees = purchaseTaxBase * (taxesPercent / 100);
    this.vatFlipDeedCalculatorOutputProperties[4].value = localTaxesAndFees;

    // Commission on the sale tax base
    const commission = saleTaxBase * (saleCommissionPercent / 100);
    this.vatFlipDeedCalculatorOutputProperties[5].value = commission;

    // Taxable profit — deed prices only
    const taxableProfit = saleTaxBase - purchaseTaxBase - renovationNet - commission - localTaxesAndFees;
    this.vatFlipDeedCalculatorOutputProperties[6].value = taxableProfit;

    // Corporate tax (10%)
    const corporateTax = taxableProfit > 0 ? taxableProfit * this.CORPORATE_TAX_RATE : 0;
    this.vatFlipDeedCalculatorOutputProperties[7].value = corporateTax;

    // Real profit — actual cash in minus actual cash out (incl. VAT due and corporate tax).
    // Equals the vat-flip-calculator profit when actual prices match the deed prices.
    const realProfitBeforeCorporateTax = saleActual - purchaseActual - renovationGross - vatDue - commission - localTaxesAndFees;
    const realProfit = realProfitBeforeCorporateTax - corporateTax;
    this.vatFlipDeedCalculatorOutputProperties[8].value = realProfit;

    // Gross real profit as % of total real investment (recoverable VAT excluded)
    const totalRealInvestment = purchaseActual - purchaseVat + renovationNet + localTaxesAndFees;
    const grossProfitPercent = totalRealInvestment > 0 ? (realProfitBeforeCorporateTax / totalRealInvestment) * 100 : 0;
    this.vatFlipDeedCalculatorOutputProperties[9].value = grossProfitPercent;
  }
}
