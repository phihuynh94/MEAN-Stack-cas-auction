import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { AuctionService } from '../../service/auction.service';
import { Auction } from '../../model/auction.model';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {

  constructor( 
    private userService: UserService,
    private itemService: ItemService,
    private auctionService: AuctionService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  items;
  auctions;
  auctionDetails = new Auction();
  userDetails = new User();
  staff: boolean;
  auctionItems;
  quickSaleItems;
  saleTotal: number;
  totalFee: number;
  clubRevenue: number;
  commission: number;
  participants;
  auctionID = this.route.snapshot.paramMap.get('id');

  ngOnInit() {
    this.getUser();
    this.getAuctions();

    if (this.auctionID != null){
      this.getItems(this.auctionID);
    }
  }
 
  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
      }
    );
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.router.navigate(['/dashboard']);
  }

  onChange(event){
    const auctionID = event.target.value;

    if (auctionID != 0){
      this.getAuctionDetails(auctionID);
  
      this.getItems(auctionID);
    }
    else if (auctionID == 0){
      this.items = [];
      this.auctionDetails = new Auction();
      this.auctionItems = [];
      this.quickSaleItems = [];
      this.saleTotal = null;
      this.totalFee = null;
      this.clubRevenue = null;
      this.commission = null;
      this.participants = [];
    }
  }

  getAuctions() {
    this.auctionService.getAllAuctionsInfo().subscribe(
      res => {
        this.auctions = res as Auction[];

        this.getAuctionDetails(this.auctionID);
      }
    );
  }

  getAuctionDetails(auctionID){
    for (let i in this.auctions){
      if (auctionID == this.auctions[i]._id){
        this.auctionDetails = this.auctions[i];
      }
    }
  }

  getItems(auctionID) {
    this.auctionItems = [];
    this.quickSaleItems = [];

    this.itemService.getItemsInAuction(auctionID).subscribe(
      res => {
        this.items = res as Item[];

        this.auctionService.getAuctionParticipants(auctionID).subscribe(
          res => {
            this.participants = res as User[];

            for(let i in this.items){
              this.participants.forEach(participant => {
                if(this.items[i].buyerID == participant._id){
                  this.items[i].buyerID = participant.alias
                }
              });
            }
          }
        )

        for (let i in this.items){
          if (this.items[i].type == 'auction'){
            this.auctionItems.push(this.items[i]);
          }
          else {
            this.quickSaleItems.push(this.items[i]);
          }
        }

        this.calculation();
      }
    );
  }

  goBack() {
    this.location.back();
  }

  calculation(){
    this.saleTotal = 0;
    this.totalFee = 0;

    for (let i in this.items){
      if (this.items[i].paid == true && this.items[i].price > 0){
        this.saleTotal += this.items[i].price;
        this.totalFee += 1;
      }
    }

    this.commission = (this.saleTotal - this.totalFee) * 0.8;

    this.clubRevenue = (this.saleTotal - this.totalFee) * 0.2;
  }
}