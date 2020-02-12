import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerItemsListComponent } from './seller-items-list.component';

describe('SellerItemsListComponent', () => {
  let component: SellerItemsListComponent;
  let fixture: ComponentFixture<SellerItemsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellerItemsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
