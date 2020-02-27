// get built in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";

// get components
import { Item } from '../../model/item.model';
import { ItemService } from '../../service/item.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';
import { AuctionService } from '../../service/auction.service';
import { Auction } from '../../model/auction.model';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private userService: UserService,
    private auctionService: AuctionService,
    )
    {}

  showSucessMessage: boolean;
  serverErrorMessages: string;
  auctionID = this.route.snapshot.paramMap.get('id');
  userDetails = new User();
  imageToUpload: File;
  sellerItems;
  auctionDetails = new Auction();
  item = new Item();
  numRegex = /^[1-9][0-9]*$/;
  formData = new FormData();

  ngOnInit() {
    this.item.auctionID = this.auctionID;
    this.getUser();
    this.getAuctionInfo();
  }

  onSubmit(form: NgForm) {
    this.item.auctionID = this.auctionID;
    this.item.itemCode = this.userDetails.alias;
    this.item.itemName = form.value.itemName;
    this.item.description = form.value.description;
    this.item.quantity = form.value.quantity;
    this.item.sellerID = this.userDetails._id;
    this.item.type = 'auction';

    if (this.imageToUpload){
      this.formData.append('images', this.imageToUpload);
      console.log(this.formData);
      this.item.images = this.formData;
      console.log(this.item);
    }
    else {
      console.log('No image selected');
    }

    this.itemService.addItem(this.item).subscribe(
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
          this.serverErrorMessages = err.error.text;
      }
    );
  }

  resetForm(form: NgForm) {
    this.item = new Item();
    form.resetForm();
    this.serverErrorMessages = '';
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
      }
    );
  }

  getAuctionInfo(){
    this.auctionService.getAuctionInfoById(this.auctionID).subscribe(
      res => {
        this.auctionDetails = res as Auction;
      }
    );
  }

  selectImage(image: any){

    if (image.files && image.files[0]){
      this.imageToUpload = image.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(this.imageToUpload);
    }
    else {
      this.imageToUpload = null;
    }
  }
}
