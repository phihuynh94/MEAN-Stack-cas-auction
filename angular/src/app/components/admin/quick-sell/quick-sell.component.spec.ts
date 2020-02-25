import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSellComponent } from './quick-sell.component';

describe('QuickSellComponent', () => {
  let component: QuickSellComponent;
  let fixture: ComponentFixture<QuickSellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickSellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
