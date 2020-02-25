// get built in
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var paypal;

// get components
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';

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
  ) { }

  userDetails = new User();
  items;
  showSuccess: boolean = false;
  totalAmount = 0;
  paidFor = false;
  
  ngOnInit() {
    this.getUser();

    console.log(this.totalAmount)
    paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: this.totalAmount
                }
              }
            ]
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          this.paidFor = true;
          console.log(order);
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
        this.getBuyerItems();
      }
    );
  }

  getBuyerItems(){
    this.itemService.getBuyerItems(this.userDetails._id).subscribe(
      res => {
        this.items = res as Item[];

        for(let i in this.items){
          this.totalAmount =  this.totalAmount + this.items[i].price
          
        }
      }
    )
  }
}
