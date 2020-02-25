// get built in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';

// get components
import { AuctionService} from '../service/auction.service';
import { Auction } from '../model/auction.model';
import { UserService } from '../user/service/user.service';
import { User } from '../user/model/user.model';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.css']
})
export class AuctionsComponent implements OnInit {

  auctionId = this.route.snapshot.paramMap.get('id');
  auctionInfo = new Auction();
  userDetails = new User();
  participantList;
  isParticipate = false;
  staff: boolean;

  constructor(
    private auctionService: AuctionService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
  )
  {}

  ngOnInit() {
    this.getAuction();
    this.getUser();
  }

  getAuction(){
    this.auctionService.getAuctionInfoById(this.auctionId).subscribe(
      res => {
        this.auctionInfo = res as Auction;
      }
    )
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];

        this.ifParticipated();
        this.isStaff();
      }
    );
  }

  onLogout(){
    this.userService.deleteToken();
    this.router.navigate(['/user/signin']);
  }

  ifParticipated(){
    this.auctionService.getAuctionParticipants(this.auctionId).subscribe(
      res => {
        this.participantList = res as User[];

        for (let part in this.participantList){

          if (this.userDetails._id == this.participantList[part]._id){
            this.isParticipate = true;
          }
        }
      }
    )
  }

  onParticipate(){
    this.auctionService.participateAuction(this.auctionId, this.userDetails._id).subscribe(
      res => {
        this.isParticipate = true;
      }
    );
  }

  onNotParticipate(){
    this.auctionService.notParticipate(this.auctionId, this.userDetails._id).subscribe(
      res => {
        this.isParticipate = false;
      }
    );
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.staff = false;
  }
}
