// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// get components
import { Auction } from '../../model/auction.model';
import { AuctionService } from '../../service/auction.service';
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { User } from '../../user/model/user.model';
import { UserService } from '../../user/service/user.service';

@Component({
  selector: 'app-live-auction',
  templateUrl: './live-auction.component.html',
  styleUrls: ['./live-auction.component.css']
})
export class LiveAuctionComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
    private itemService: ItemService,
    private userService: UserService,
    private router: Router,
    private location: Location,
  )
  { }

  // variables
  auctionID = this.route.snapshot.paramMap.get('id');
  auction = new Auction();
  items;
  orderedAuctionItems = [];
  participants;
  i = 0;
  winnerNum;
  search: string;
  searchMsg: string;
  isSearch: boolean = false;
  userDetails = new User();
  staff: boolean;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  numRegex = /^[1-9][0-9]*$/;
  errorMessage: string;
  successMessage: string;
  
  ngOnInit() {
    this.getAuctionInfo();
    this.getParticipants();
    this.getUser();
  }

  getAuctionInfo(){
    this.auctionService.getAuctionInfoById(this.auctionID).subscribe(
      res => {
        this.auction = res as Auction;

        this.getAuctionItems();
      }
    );
  }

  getAuctionItems(){
    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.items = res as Item[];

        for (var i = 0; i < this.auction.orderedList.length; i++){
          for (var j = 0; j < this.items.length; j++){
            if (this.auction.orderedList[i] == this.items[j]._id){
              this.orderedAuctionItems[i] = this.items[j];
            }
          }
        }
      }
    );
  }

  getParticipants(){
    this.auctionService.getAuctionParticipants(this.auctionID).subscribe(
      res => {
        this.participants = res as User[];
      }
    );
  }

  onNext(){
    if (this.i < this.orderedAuctionItems.length - 1){
      this.i += 1;
    }
    else{
      console.log('This is the last item');
    }
  }

  onPrev(){
    if (this.i != 0){
      this.i -= 1;
    }
    else {
      console.log('This is the first item');
    }
  }

  onSubmit(){
    if (this.winnerNum > (this.participants.length)){
      this.errorMessage = 'Bidder number not found.';
    }
    else {
      this.orderedAuctionItems[this.i].buyerID = this.participants[this.winnerNum - 1]._id;

      this.itemService.editItem(this.orderedAuctionItems[this.i]).subscribe(
        res => {
          this.errorMessage = '';
          this.winnerNum = '';

          if (this.i < this.orderedAuctionItems.length - 1){
            this.i++;
          }

          this.getAuctionInfo();
        }
      );
    }
  }

  onSearch(){
    for (var i = 0; i < this.orderedAuctionItems.length; i++){
      if (this.search.toUpperCase() == this.orderedAuctionItems[i].itemCode){
        this.i = i;
        this.isSearch = true;
        this.searchMsg = '';
      }
    }

    if (this.isSearch == false) {
      this.searchMsg = 'No item found.';
      setTimeout(() => this.searchMsg = '', 4000);
    }

    this.isSearch = false;
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

  goBack() {
    this.location.back();
  }
}
