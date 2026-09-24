import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'calculator',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    TranslatePipe,
  ],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent {
  @Input() public inputs: CalculatorInputModel[] = [];
  @Input() public results: CalculatorResultModel[] = [];

  @Output() public calculate: EventEmitter<void[]> = new EventEmitter<void[]>();

  public calculateResults(): void {
    this.showResults = true;
    this.calculate.emit();
  }

  public showResults: boolean = false;

  private static readonly CATEGORY_ORDER: string[] = ['cat_purchase', 'cat_vat', 'cat_taxes', 'cat_loan', 'cat_profit'];

  public get groupedResults(): { category: string; items: CalculatorResultModel[] }[] {
    const groups = new Map<string, CalculatorResultModel[]>();
    for (const result of this.results) {
      const cat = result.category ?? '';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(result);
    }

    const order = CalculatorComponent.CATEGORY_ORDER;
    return Array.from(groups.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => {
        const ai = order.indexOf(a.category);
        const bi = order.indexOf(b.category);
        return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
      });
  }
}
