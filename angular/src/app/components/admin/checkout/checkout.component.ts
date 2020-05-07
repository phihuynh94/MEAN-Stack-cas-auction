import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// get components
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';

declare var paypal;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
    private itemService: ItemService,
    private location: Location,
  ) { }

  userDetails = new User();
  staff: boolean;
  searchMsg: string;
  searchAlias: string;
  checkoutUser = new User();
  buyingItems;
  sellingItems;
  buyingAmount: number = 0;
  sellingAmount: number = 0;
  fee: number = 0;
  totalAmount: number = 0;
  purchaseAmount: number = 0;
  payoutAmount: number = 0;
  commissionAmount: number = 0;
  users;
  isPaid: boolean;
  buyerAlias;
  imgUrl = this.itemService.imgUrl;

  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;

  ngOnInit() {
    this.getUser();
    this.payPal();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
        this.isStaff();
      }
    );
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.router.navigate(['/dashboard']);
  }

  onSearch(){
    this.userService.getUserByAlias(this.searchAlias).subscribe(
      res => {
        if (res == null){
          this.searchMsg = 'Cannot find user with this alias.';
          this.checkoutUser = new User();
          this.buyingItems = [];
          this.sellingItems = [];
          this.buyingAmount = 0;
          this.sellingAmount = 0;
          this.purchaseAmount = 0;
          this.payoutAmount = 0;
          this.commissionAmount = 0;
          this.fee = 0;
          this.totalAmount = 0;
        }
        else {
          this.searchMsg = '';
          this.checkoutUser = res as User;
          this.buyingItems = [];
          this.sellingItems = [];
          this.buyingAmount = 0;
          this.sellingAmount = 0;
          this.getBuyingItems();
        }
      },
      err => {
        this.searchMsg = 'No input on search bar';
        this.checkoutUser = new User();
        this.buyingItems = [];
        this.sellingItems = [];
        this.buyingAmount = 0;
        this.sellingAmount = 0;
        this.purchaseAmount = 0;
        this.payoutAmount = 0;
        this.commissionAmount = 0;
        this.fee = 0;
        this.totalAmount = 0;
      }
    );
  }

  getBuyingItems(){
    this.itemService.getBuyingItems(this.checkoutUser._id).subscribe(
      res => {
        if (res[0] != null){
          this.buyingItems = res as Item[];

          for(let i in this.buyingItems){
            this.buyingAmount =  this.buyingAmount + this.buyingItems[i].price;
          }
        }

        this.getSellingItems();
      }
    )
  }

  getSellingItems(){
    this.fee = 0;
    this.buyerAlias = [];

    this.itemService.getSellingItems(this.checkoutUser._id).subscribe(
      res => {
        if (res[0] != null){
          this.sellingItems = res as Item[];

          for (let i in this.sellingItems){
            if (this.sellingItems[i].price > 0){
              this.sellingAmount += + this.sellingItems[i].price;
              this.fee++;
            }
          }
        }

        this.userService.getUsers().subscribe(
          res => {
            this.users = res as User[];

            for(let i in this.sellingItems){
              this.users.forEach(user => {
                if(this.sellingItems[i].buyerID == user._id){
                  this.buyerAlias[i] = user.alias;
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
    this.isPaid = false;

    this.commissionAmount = (this.sellingAmount - this.fee) * 0.8;
    this.totalAmount = this.buyingAmount - this.commissionAmount;
    
    if (this.totalAmount > 0){
      this.purchaseAmount = this.totalAmount;
    }
    else if (this.totalAmount < 0){
      this.payoutAmount = this.totalAmount * (-1);
      this.checkoutUser.payout = true;
      this.checkoutUser.payoutAmount = this.payoutAmount;
      this.userService.editUser(this.checkoutUser).subscribe();
    }
  }

  goBack() {
    this.location.back();
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
          
          this.sendPaymentInfo();
        },
        onError: err => {
          console.log(err);
        }
      })
      .render(this.paypalElement.nativeElement);
  }

  onPayout(){
    this.checkoutUser.payout = false;
    this.checkoutUser.payoutAmount = 0;
    this.userService.editUser(this.checkoutUser).subscribe();
    this.sendPaymentInfo();
  }

  onPayByCash(){
    this.sendPaymentInfo();
  }

  sendPaymentInfo(){
    const paymentInfo = { 
      "user": this.checkoutUser, "buyingItems": this.buyingItems, "sellingItems": this.sellingItems,
      "buyingAmount": this.buyingAmount, "sellingAmount": this.sellingAmount, "fee": this.fee, "commission": this.commissionAmount,
      "purchaseAmount": this.purchaseAmount, "payoutAmount": this.payoutAmount
    }

    this.userService.sendPaymentInfo(paymentInfo).subscribe();

    for (let i in this.buyingItems){
      this.buyingItems[i].paid = true;
      this.itemService.editItem(this.buyingItems[i]).subscribe();
      this.itemService.removePaidItem(this.buyingItems[i]).subscribe();
    }

    for (let i in this.sellingItems){
      if (this.sellingItems[i].paid == true){
        this.sellingItems[i].payout = true;
        this.itemService.editItem(this.sellingItems[i]).subscribe();
      }
    }

    this.isPaid = true;
  }
}
