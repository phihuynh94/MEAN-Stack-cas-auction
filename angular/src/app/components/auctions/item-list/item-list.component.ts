// get built in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
  ) 
  {}

  // Variables
  itemInfo;
  auctionID = this.route.snapshot.paramMap.get('id');

  ngOnInit() {
    this.getItems();
  }

  // get all of item's info in the Auction
  getItems() {
    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.itemInfo = res as Item[];
      }
    );
  }

  // refresh item list
  refresh() {
    this.getItems();
  }
}
