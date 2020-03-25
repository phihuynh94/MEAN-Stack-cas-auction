import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineOrderComponent } from './define-order.component';

describe('DefineOrderComponent', () => {
  let component: DefineOrderComponent;
  let fixture: ComponentFixture<DefineOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
