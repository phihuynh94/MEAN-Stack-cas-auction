// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-seller-items-list',
  templateUrl: './seller-items-list.component.html',
  styleUrls: ['./seller-items-list.component.css']
})
export class SellerItemsListComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) { }

  // Variables
  sellerItems;
  sellerDetails;
  item = new Item();
  auctionID = this.route.snapshot.paramMap.get('id');

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.sellerDetails = res['user'];
        this.getSellerItems();
      },
      err => { 
        console.log(err);
      }
    );
  }

  getSellerItems(){
    this.item.sellerID = this.sellerDetails._id;
    this.item.auctionID = this.auctionID;

    this.itemService.getSellerItemsInAuction(this.item).subscribe(
      res => {
        this.sellerItems = res as Item[];
      },
      err => {
        console.log(err);
      }
    );
  }

    // refresh item list
    refresh() {
      this.getSellerItems();
    }
}
