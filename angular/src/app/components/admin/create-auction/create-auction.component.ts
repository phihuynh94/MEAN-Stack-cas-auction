// get built in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

// get components
import { Auction } from '../../model/auction.model';
import { AuctionService } from '../../service/auction.service';

@Component({
  selector: 'app-create-auction',
  templateUrl: './create-auction.component.html',
  styleUrls: ['./create-auction.component.css']
})
export class CreateAuctionComponent implements OnInit {

  constructor(
    private auctionService: AuctionService
  ) { }

  showSucessMessage: boolean;
  serverErrorMessages: string;
  auction = new Auction();
  numRegex = /^[1-9][0-9]*$/;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this.auctionService.createAuction(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.resetForm(form);
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else
          this.serverErrorMessages = 'Something went wrong.Please contact admin.';
      }
    );
  }

  resetForm(form: NgForm) {
    this.auction = new Auction();
    form.resetForm();
    this.serverErrorMessages = '';
  } 
}
