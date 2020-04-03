// get built in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private userService: UserService,
  ) 
  {}

  ngOnInit() {
    this.getItems();
    this.getSeller();
    this.getUser();
  }

  // Variables
  itemsInfo;
  auctionID = this.route.snapshot.paramMap.get('id');
  auctionItems;
  quickSellItems;
  sellerItems;
  sellerDetails = new User();
  item = new Item();
  userDetails = new User();
  isCardView = false; 

  // get all of item's info in the Auction
  getItems() {
    this.auctionItems = [];
    this.quickSellItems = [];

    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.itemsInfo = res as Item[];

        // split auction and quicksell into 2 array
        for (var i = 0; i < this.itemsInfo.length; i++){
          if (this.itemsInfo[i].type == 'auction'){
            this.auctionItems.push(this.itemsInfo[i]);
          }
          else {
            this.quickSellItems.push(this.itemsInfo[i]);
          }
        }
      }
    );
  }

  // refresh item list
  refresh() {
    this.getItems();
    this.getSellerItems();
  }

  getSeller(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.sellerDetails = res['user'];
        this.getSellerItems();
      }
    );
  }

  getSellerItems(){
    this.item.sellerID = this.sellerDetails._id;
    this.item.auctionID = this.auctionID;

    this.itemService.getSellerItemsInAuction(this.item).subscribe(
      res => {
        this.sellerItems = res as Item[];
      }
    );
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
      }
    );
  }

  changeView(){
    if (this.isCardView == false){
      this.isCardView = true;
    }
    else {
      this.isCardView = false;
    }
  }

  getItemImages(imageName: string){
    return this.itemService.getItemImages(imageName);
  }
}
