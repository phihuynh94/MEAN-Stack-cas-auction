// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

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
  )
  { }

  // variables
  auctionID = this.route.snapshot.paramMap.get('id');
  auction = new Auction();
  items;
  participants;
  i = 0;
  winnerNum;
  search: String;
  searchItem;
  userDetails = new User();
  staff: boolean;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  numRegex = /^[1-9][0-9]*$/;
  errorMessage: String;
  successMessage: String;
  
  ngOnInit() {
    this.getAuctionInfo();
    this.getAuctionItems();
    this.getParticipants();
    this.getUser();
  }

  getAuctionInfo(){
    this.auctionService.getAuctionInfoById(this.auctionID).subscribe(
      res => {
        this.auction = res as Auction;
      }
    );
  }

  getAuctionItems(){
    this.itemService.getItemsInAuction(this.auctionID).subscribe(
      res => {
        this.items = res as Item[];
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
    if (this.winnerNum > (this.participants.length)){
      this.errorMessage = 'Invalid winner number.';
    }
    else {
      this.items[this.i].buyerID = this.participants[this.winnerNum - 1]._id;

      this.itemService.editItem(this.items[this.i]).subscribe(
        res => {
          this.successMessage = 'Sold.';
          this.errorMessage = '';
        }
      );
    }
  }

  onSearch(){
    this.itemService.getItemByItemCode(this.search.toUpperCase()).subscribe(
      res => {
        console.log(res);
      }
    );
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
}
