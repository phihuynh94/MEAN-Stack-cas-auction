// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// get components
import { Auction } from '../../model/auction.model';
import { AuctionService } from '../../service/auction.service';
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { User } from '../../user/model/user.model';

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
  )
  { }

  // variables
  auctionID = this.route.snapshot.paramMap.get('id');
  auction = new Auction();
  items;
  participants;
  i = 0;
  winnerNum;
  
  ngOnInit() {
    this.getAuctionInfo();
    this.getAuctionItems();
    this.getParticipants();
  }

  getAuctionInfo(){
    this.auctionService.getAuctionInfoById(this.auctionID).subscribe(
      res => {
        this.auction = res as Auction;
      },
      err => {
        console.log(err);
      }
    )
  }

  getAuctionItems(){
    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.items = res as Item[];
      },
      err => {
        console.log(err);
      }
    );
  }

  getParticipants(){
    this.auctionService.getAuctionParticipants(this.auctionID).subscribe(
      res => {
        this.participants = res as User[];
      },
      err => {
        console.log(err);
      }
    )
  }

  onNext(){
    if (this.i < this.items.length - 1){
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
    this.items[this.i].buyerID = this.participants[this.winnerNum - 1]._id;

    console.log(this.items[this.i]);

    this.itemService.sellItem(this.items[this.i]).subscribe();

    return true;
  }
}
