import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalculatorInputModel } from '../../models/calculator-model/calculator-input';
import { CalculatorResultModel } from '../../models/calculator-model/calculator-result';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
}
