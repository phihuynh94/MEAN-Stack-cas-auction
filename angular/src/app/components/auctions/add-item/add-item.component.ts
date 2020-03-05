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
  imagesToUpload: File [];
  sellerItems;
  auctionDetails = new Auction();
  item = new Item();
  numRegex = /^[1-9][0-9]*$/;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  formData = new FormData();
  imgSrc = [];
  imgMsg: string;
  code: string;

  ngOnInit() {
    this.item.auctionID = this.auctionID;
    this.getUser();
    this.getAuctionInfo();
  }

  onSubmit(form: NgForm) {

    this.item.auctionID = this.auctionID;
    this.item.itemCode = this.userDetails.alias + form.value.itemCode;
    this.item.itemName = form.value.itemName;
    this.item.description = form.value.description;
    this.item.quantity = form.value.quantity;
    this.item.sellerID = this.userDetails._id;
    this.item.type = form.value.type;

    if (this.imagesToUpload){
      
      var i = 0;
      this.item.images = [];

      for (let img of this.imagesToUpload){
        this.item.images[i] = img.name;
        this.formData.append('images', img);
        i++;
      }
    }

    this.itemService.addItem(this.item).subscribe(
      res => {

        if (this.imagesToUpload){
          this.itemService.uploadImages(this.formData).subscribe();
        }
        
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
          this.code = this.item.itemCode.substring(3, 6);
      }
    );
  }

  resetForm(form: NgForm) {
    this.item = new Item();
    form.resetForm();
    this.serverErrorMessages = '';
    this.imgMsg = '';
    this.imgSrc = null;
    this.imagesToUpload = null;
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

    this.imagesToUpload = [];
    this.imgSrc = [];
    this.imgMsg = '';

    if (image.files){
      if (image.files.length > 5){
        this.imgMsg = 'Maximum 5 images.';
      }
      else {
        this.imagesToUpload = image.files;
      }

      for (var i = 0; i < this.imagesToUpload.length; i++){

        const reader = new FileReader();

        reader.onload = (event: any) => {
          this.imgSrc.push(event.target.result);
        }

        reader.readAsDataURL(image.files[i]);
      }
    }
    else {
      this.imagesToUpload = null;
    }
  }
}
