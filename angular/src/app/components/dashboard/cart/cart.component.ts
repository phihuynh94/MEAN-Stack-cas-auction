// get built in
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
    private router: Router,
    private ngZone: NgZone,
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
  users;
  imgUrl = this.itemService.imgUrl;

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
                  value: this.purchaseAmount.toFixed(2),
                }
              }
            ]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          this.sendPaymentInfo();
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

        this.userService.getUsers().subscribe(
          res => {
            this.users = res as User[];

            for(let i in this.sellingItems){
              this.users.forEach(user => {
                if(this.sellingItems[i].buyerID == user._id){
                  this.sellingItems[i].buyerID = user.alias
                }
              });
            }
          }
        );

        this.calculation();
      }
    )
  }

  calculation(){
    this.totalAmount = 0;
    this.commissionAmount = 0;

    this.commissionAmount = (this.sellingAmount - this.fee) * 0.8;
    this.totalAmount = this.buyingAmount - this.commissionAmount;

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

  sendPaymentInfo(){
    const paymentInfo = { 
      "user": this.userDetails, "buyingItems": this.buyingItems, "sellingItems": this.sellingItems,
      "buyingAmount": this.buyingAmount, "sellingAmount": this.sellingAmount, "fee": this.fee, "commission": this.commissionAmount,
      "purchaseAmount": this.purchaseAmount, "payoutAmount": this.payoutAmount
    }

    this.userService.sendPaymentInfo(paymentInfo).subscribe();

    this.ngZone.run(() => this.router.navigate(['/paymentInfo']));
  }
}
