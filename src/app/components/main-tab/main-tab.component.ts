import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RentCalculatorComponent } from '../rent-calculator/rent-calculator.component';
import { FlipCalculatorComponent } from '../flip-calculator/flip-calculator.component';
import { VatFlipCalculatorComponent } from '../vat-flip-calculator/vat-flip-calculator.component';
import { VatFlipDeedCalculatorComponent } from '../vat-flip-deed-calculator/vat-flip-deed-calculator.component';
import { LoanCalculatorComponent } from "../loan-calculator/loan-calculator.component";
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorSidebarComponent } from "../calculator-sidebar/calculator-sidebar.component";

@Component({
  selector: 'app-tab-switcher',
  templateUrl: './main-tab.component.html',
  styleUrl: './main-tab.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    RentCalculatorComponent,
    FlipCalculatorComponent,
    VatFlipCalculatorComponent,
    VatFlipDeedCalculatorComponent,
    LoanCalculatorComponent,
    TranslatePipe,
    CalculatorSidebarComponent
]
})
export class MainTabComponent {
  // Translation keys, also used as the calculator ids
  public readonly calculators = ['vat_flip', 'vat_flip_deed', 'flip', 'rent', 'loan', 'constants'];

  public selectedCalculator = this.calculators[0];
}
