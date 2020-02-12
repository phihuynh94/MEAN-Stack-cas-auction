// get built in
import { Component, OnInit } from '@angular/core';

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

  constructor(
    private userService: UserService,
    private itemService: ItemService,
  ) { }

  userDetails = new User;
  items;
  total = 0;

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
        this.getBuyerItems();
      },
      err => { 
        console.log(err);
      }
    );
  }

  getBuyerItems(){
    this.itemService.getBuyerItems(this.userDetails._id).subscribe(
      res => {
        this.items = res as Item[];

        // Calculate the total
        for (let i in this.items){
          this.total += this.items[i].price;
        }
      },
      err => {
        console.log(err);
      }
    )
  }
}
