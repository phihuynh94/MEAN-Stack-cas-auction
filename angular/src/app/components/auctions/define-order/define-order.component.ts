import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { AuctionService } from '../../service/auction.service';
import { Auction } from '../../model/auction.model';

@Component({
  selector: 'app-define-order',
  templateUrl: './define-order.component.html',
  styleUrls: ['./define-order.component.css']
})
export class DefineOrderComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private auctionService: AuctionService,
  ) { }

  // Variables
  items;
  auctionID = this.route.snapshot.paramMap.get('id');
  selectItem = new Item();
  unorderList = [];
  orderedList = [];
  unorderItem = new Item();
  orderedItem = new Item();
  auctionDetails = new Auction();
  searchItemCode: string;
  showQueueBtn: boolean = false;
  showEnqueueBtn: boolean = false;
  searchMsg: string;
  index: number;

  ngOnInit() {
    this.getItems();
  }

  getItems() {
    // Get all items in auction
    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.items = res as Item[];

        // Get auction info by id
        this.auctionService.getAuctionInfoById(this.auctionID).subscribe(
          res => {
            this.auctionDetails = res as Auction;

            for (let i in this.items){
              for (let j in this.auctionDetails.unorderList){
                if (this.items[i]._id == this.auctionDetails.unorderList[j]){
                  this.unorderList.push(this.items[i]);
                }
              }
            }

            for (let k in this.auctionDetails.orderedList){
              for (let i in this.items){
                if (this.items[i]._id == this.auctionDetails.orderedList[k]){
                  this.orderedList.push(this.items[i]);
                }
              }
            }
          }
        )
      }
    );
  }

  // Get and display the selected item from unorder list
  selectUnorderItem(selectUnorderItem: Item){
    this.selectItem = selectUnorderItem;
    this.searchItemCode = selectUnorderItem.itemCode;
    this.searchMsg = '';

    if (this.selectItem.itemCode == this.unorderItem.itemCode){
      this.showQueueBtn = true;
      this.showEnqueueBtn = false;
    }

    if (this.selectItem.itemCode == this.orderedItem.itemCode){
      this.showEnqueueBtn = true;
      this.showQueueBtn = false;
    }
  }

  // Get and display the selected item from ordered list
  selectOrderedItem(selectOrderedItem: Item, i: number){
    this.selectItem = selectOrderedItem;
    this.searchItemCode = selectOrderedItem.itemCode;
    this.searchMsg = '';
    this.index = i;

    if (this.selectItem.itemCode == this.unorderItem.itemCode){
      this.showQueueBtn = true;
      this.showEnqueueBtn = false;
    }

    if (this.selectItem.itemCode == this.orderedItem.itemCode){
      this.showEnqueueBtn = true;
      this.showQueueBtn = false;
    }
  }

  onQueue(){
    // Find the selected item
    for (var i = 0; i < this.unorderList.length; i++){
      if (this.unorderItem.itemCode == this.unorderList[i].itemCode){

        // Queue item into ordered list from unorder list
        this.orderedList.push(this.unorderList[i]);

        // Remove item from unorder list
        this.unorderList.splice(i, 1);
      }
    }

    // Send the lists to backend to save in auction collection
    this.auctionDetails.unorderList = this.unorderList;
    this.auctionDetails.orderedList = this.orderedList;
    this.auctionService.editAuction(this.auctionDetails).subscribe();

    this.showQueueBtn = false;
    this.unorderItem = new Item();
  }

  onEnqueue(){
    // Find the selected item
    for (var i = 0; i < this.orderedList.length; i++){
      if (this.orderedItem.itemCode == this.orderedList[i].itemCode){

        // Enqueue item into unorder list from ordered list
        this.unorderList.push(this.orderedList[i]);

        // Remove item from ordered list
        this.orderedList.splice(i, 1);
      }
    }

    // Send the lists to backend to save in auction collection
    this.auctionDetails.unorderList = this.unorderList;
    this.auctionDetails.orderedList = this.orderedList;
    this.auctionService.editAuction(this.auctionDetails).subscribe();

    this.showEnqueueBtn = false;
    this.orderedItem = new Item();
  }

  onSearch(){
    this.selectItem = new Item();

    for (let i in this.unorderList){
      if (this.searchItemCode.toUpperCase() == this.unorderList[i].itemCode){
        this.selectItem = this.unorderList[i];
        this.unorderItem.itemCode = this.selectItem.itemCode;
        this.showQueueBtn = true;
        this.showEnqueueBtn = false;
        this.searchMsg = '';
      }
    }

    for (let i in this.orderedList){
      if (this.searchItemCode.toUpperCase() == this.orderedList[i].itemCode){
        this.selectItem = this.orderedList[i];
        this.orderedItem.itemCode = this.selectItem.itemCode;
        this.showEnqueueBtn = true;
        this.showQueueBtn = false;
        this.searchMsg = '';
      }
    }

    if (this.selectItem.itemCode == null){
      this.searchMsg = 'Item code not found.';
    }
  }

  topBtn(){
    if (this.index > 0){
      this.arrayMove(this.orderedList, this.index, 0);
      this.index = 0;

      this.auctionDetails.orderedList = this.orderedList;
      this.auctionService.editAuction(this.auctionDetails).subscribe();
    }
  }

  upBtn(){
    if (this.index > 0){
      this.arrayMove(this.orderedList, this.index, this.index - 1);
      this.index -= 1;

      this.auctionDetails.orderedList = this.orderedList;
      this.auctionService.editAuction(this.auctionDetails).subscribe();
    }
  }

  downBtn(){
    if (this.index < this.orderedList.length - 1){
      this.arrayMove(this.orderedList, this.index, this.index + 1);
      this.index += 1;

      this.auctionDetails.orderedList = this.orderedList;
      this.auctionService.editAuction(this.auctionDetails).subscribe();
    }
  }

  bottomBtn(){
    if (this.index < this.orderedList.length - 1){
      this.arrayMove(this.orderedList, this.index, this.orderedList.length - 1);
      this.index = this.orderedList.length - 1;

      this.auctionDetails.orderedList = this.orderedList;
      this.auctionService.editAuction(this.auctionDetails).subscribe();
    }
  }

  arrayMove(arr, old_index, new_index){
    while (old_index < 0){
      old_index += arr.length;
    }
    while (new_index < 0){
      new_index += arr.length;
    }
    if (new_index >= arr.length){
      var k = new_index - arr.length;
      while ((k--) + 1){
        arr.push(undefined);
      }
    }

    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
}