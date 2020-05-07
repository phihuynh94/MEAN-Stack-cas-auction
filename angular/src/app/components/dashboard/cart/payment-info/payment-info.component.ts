import { Component, OnInit } from '@angular/core';

// get components
import { UserService } from '../../../user/service/user.service';
import { User } from '../../../user/model/user.model';
import { ItemService } from '../../../service/item.service';
import { Item } from '../../../model/item.model';

@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.css']
})
export class PaymentInfoComponent implements OnInit {

  constructor(
    private userService: UserService,
    private itemService: ItemService,
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

  ngOnInit() {
    this.getUser();
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
          this.buyingItems[i].paid = true;
          this.itemService.editItem(this.buyingItems[i]).subscribe();
          this.itemService.removePaidItem(this.buyingItems[i]).subscribe();
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
            this.sellingAmount += this.sellingItems[i].price;
            this.fee++;
            this.sellingItems[i].payout = true;
            this.itemService.editItem(this.sellingItems[i]).subscribe();
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
}

