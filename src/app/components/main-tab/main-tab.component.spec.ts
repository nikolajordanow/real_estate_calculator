import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { MainTabComponent } from './main-tab.component';

describe('MainTabComponent', () => {
  let component: MainTabComponent;
  let fixture: ComponentFixture<MainTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTabComponent, TranslateModule.forRoot(), NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
