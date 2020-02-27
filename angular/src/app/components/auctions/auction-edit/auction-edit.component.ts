// get built in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

// get components
import { Auction } from '../../model/auction.model';
import { AuctionService } from '../../service/auction.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-auction-edit',
  templateUrl: './auction-edit.component.html',
  styleUrls: ['./auction-edit.component.css']
})
export class AuctionEditComponent implements OnInit {

  constructor(
    private auctionService: AuctionService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserService,
  ) { }

  id = this.route.snapshot.paramMap.get('id');
  auction = new Auction();
  showSucessMessage: boolean;
  serverErrorMessages: string;
  userDetails = new User();
  numRegex = /^[1-9][0-9]*$/;
  staff: boolean;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  
  ngOnInit() {
    this.getUser();
    this.getAuctionInfo();
  }

  getAuctionInfo(){
    this.auctionService.getAuctionInfoById(this.id).subscribe(
      res => {
        this.auction = res as Auction;
      }
    )
  }

  onSubmit(form: NgForm){
    this.auctionService.editAuction(form.value).subscribe(
      (res) => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.serverErrorMessages = '';
      },
      err => {
          this.serverErrorMessages = err.error.text;
      }
    );
  }

  deleteAuction() {
    if (confirm('Are you sure to delete this record?') === true){
      this.auctionService.deleteAuction(this.id).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }

  goBack() {
    this.location.back();
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
