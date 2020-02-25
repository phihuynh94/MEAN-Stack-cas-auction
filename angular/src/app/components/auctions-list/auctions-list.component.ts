// get built in
import { Component, OnInit } from '@angular/core';

// get components
import { AuctionService } from '../service/auction.service';
import { Auction } from '../model/auction.model';

@Component({
  selector: 'app-auctions-list',
  templateUrl: './auctions-list.component.html',
  styleUrls: ['./auctions-list.component.css']
})
export class AuctionsListComponent implements OnInit {

  constructor(
    private auctionService: AuctionService,
  ) { }

  auctionsInfo;
  
  ngOnInit() {
    this.getAuctions();
  }

  // Get all of the auctions' info on init
  getAuctions() {
    this.auctionService.getAllAuctionsInfo().subscribe(
      res => {
        this.auctionsInfo = res as Auction[];
      }
    );
  }

  // refresh auction list
  refresh() {
    this.getAuctions();
  }
}
