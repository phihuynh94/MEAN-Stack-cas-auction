// get built in
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';

// get components
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';

declare var paypal;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;

  constructor(
    private userService: UserService,
    private itemService: ItemService,
    private location: Location,
  ) { }

  userDetails = new User();
  buyingItems;
  sellingItems;
  showSuccess: boolean = false;
  buyingAmount: number = 0;
  sellingAmount: number = 0;
  totalAmount: number = 0;
  purchaseAmount: number = 0;
  payoutAmount: number = 0;
  commissionAmount: number = 0;
  fee: number = 0;

  // paidFor = false;
  
  ngOnInit() {
    this.getUser();
    this.payPal();
  }

  payPal(){
    paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: this.purchaseAmount
                }
              }
            ]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          const paymentInfo = { "order": order.purchase_units, "user": this.userDetails, "items": this.buyingItems}
          
          // this.paidFor = true;

          console.log(order);
          console.log(paymentInfo);
        },
        onError: err => {
          console.log(err);
        }
      })
      .render(this.paypalElement.nativeElement);
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
        this.getBuyingItems();
      }
    );
  }

  getBuyingItems(){
    this.itemService.getBuyingItems(this.userDetails._id).subscribe(
      res => {
        this.buyingItems = res as Item[];

        for(let i in this.buyingItems){
          this.buyingAmount =  this.buyingAmount + this.buyingItems[i].price;
        }

        this.getSellingItems();
      }
    )
  }

  getSellingItems(){
    this.fee = 0;

    this.itemService.getSellingItems(this.userDetails._id).subscribe(
      res => {
        this.sellingItems = res as Item[];

        for (let i in this.sellingItems){
          if (this.sellingItems[i].price > 0){
            this.sellingAmount += + this.sellingItems[i].price;
            this.fee++;
          }
        }

        this.calculation();
      }
    )
  }

  calculation(){
    this.totalAmount = 0;
    this.commissionAmount = 0;

    this.totalAmount = this.buyingAmount - ((this.sellingAmount - this.fee) * 0.8);
    this.commissionAmount = (this.sellingAmount - this.fee) * 0.2;

    if (this.totalAmount > 0){
      this.purchaseAmount = this.totalAmount;
    }
    else {
      this.payoutAmount = this.totalAmount * (-1);
    }
  }

  goBack() {
    this.location.back();
  }

  onCheckout(){
    
  }
}
