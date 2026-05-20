import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RentCalculatorComponent } from '../rent-calculator/rent-calculator.component';
import { FlipCalculatorComponent } from '../flip-calculator/flip-calculator.component';
import { VatFlipCalculatorComponent } from '../vat-flip-calculator/vat-flip-calculator.component';
import { LoanCalculatorComponent } from "../loan-calculator/loan-calculator.component";
import { TranslatePipe } from '@ngx-translate/core';
import { CalculatorSidebarComponent } from "../calculator-sidebar/calculator-sidebar.component";

@Component({
  selector: 'app-tab-switcher',
  templateUrl: './main-tab.component.html',
  styleUrl: './main-tab.component.scss',
  standalone: true,
  imports: [
    MatTabsModule,
    RentCalculatorComponent,
    FlipCalculatorComponent,
    VatFlipCalculatorComponent,
    LoanCalculatorComponent,
    TranslatePipe,
    CalculatorSidebarComponent
]
})
export class MainTabComponent {

}
