// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location, formatDate } from '@angular/common';
import { NgForm } from '@angular/forms';

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';
import { AuctionService } from '../../service/auction.service';

@Component({
  selector: 'app-item-page',
  templateUrl: './item-page.component.html',
  styleUrls: ['./item-page.component.css']
})
export class ItemPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private userService: UserService,
    private location: Location,
    private auctionService: AuctionService,
  ) { }

  ngOnInit() {
    this.getItemInfo();
    this.getUser();
  }

  // Variables
  itemID = this.route.snapshot.paramMap.get('id');
  itemInfo = new Item();
  sellerInfo = new User();
  showSuccessMessage : boolean;
  serverErrorMessages : string;
  userDetails = new User();
  staff : boolean;
  numRegex = /^[1-9][0-9]*$/;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  code;
  buyerDetails = new User();
  quickSellSuccessMessage: boolean;
  quickSellErrorMessage: string;
  buyerAlias: string;
  imgUrl = this.itemService.imgUrl;
  participants;
  isNum: boolean;
  images = [];
  imagesToUpload: File [];
  imgMsg: string;
  selectImage: string;
  buyerInput: string;
  imgAmount: number;
  bidderNum: number;
  formData = new FormData();

  getItemInfo(){
    this.itemService.getItemInfoById(this.itemID).subscribe(
      res => {
        this.itemInfo = res as Item;
        this.code = this.itemInfo.itemCode.match(/\d+/g);

        this.images = [];
        this.imgAmount = 0;

        for (let image of this.itemInfo.images){
          this.itemService.getImage(image).subscribe(
            res => {
              this.images.push(res);
              this.imgAmount = this.images.length;
            }
          );
        }
        
        this.getSellerInfo();
        this.getParticipants(this.itemInfo.auctionID);
      }
    );
  }

  getSellerInfo(){
    this.userService.getUserById(this.itemInfo.sellerID).subscribe(
      res => {
        this.sellerInfo = res as User;
      }
    );
  }

  onBackBtn(){
    this.location.back();
  }

  onEditItemSubmit(form: NgForm){
    form.value.itemCode = this.sellerInfo.alias + this.code;
    form.value.images = this.itemInfo.images;
    form.value.auctionID = this.itemInfo.auctionID;

    if (form.value.buyer != null){
      this.userService.getUserByAlias(form.value.buyer).subscribe(
        res => {
          this.buyerDetails = res as User;
  
          if (this.buyerDetails == null){
            this.isNum = /^\d+$/.test(form.value.buyer);
            if (this.isNum) {
              if (form.value.buyer > this.participants.length || form.value.buyer < 1){
                this.serverErrorMessages = 'Bidder number not found.';
                setTimeout(() => this.serverErrorMessages = '', 4000);
              }
              else {
                form.value.buyerID = this.participants[form.value.buyer - 1]._id;
                this.itemService.editItem(form.value).subscribe(
                  res => {
                    this.showSuccessMessage = true;
                    setTimeout(() => this.showSuccessMessage = false, 4000);
                    this.serverErrorMessages = '';
                  },
                  err => {
                    this.serverErrorMessages = 'Duplicate item code.';
                  }
                )
              }
            }
            else {
              this.serverErrorMessages = 'No user with this alias found.';
              setTimeout(() => this.serverErrorMessages = '', 4000);
            }
          }
          else {
            form.value.buyerID = this.buyerDetails._id;
            this.itemService.editItem(form.value).subscribe(
              res => {
                this.showSuccessMessage = true;
                setTimeout(() => this.showSuccessMessage = false, 4000);
                this.serverErrorMessages = '';
              }
            );
          }
        }
      );
    }
    else {
      form.value.buyerID = this.itemInfo.buyerID;
      this.itemService.editItem(form.value).subscribe(
        res => {
          this.showSuccessMessage = true;
          setTimeout(() => this.showSuccessMessage = false, 4000);
          this.serverErrorMessages = '';
        }
      );
    }
  }

  onDeleteItem(){
    if (confirm('Are you sure to delete this item?') === true){
      for (let image of this.images){
        this.itemService.deleteImage(image._id).subscribe();
      }

      this.itemService.deleteItemById(this.itemID).subscribe(() => {
        this.location.back();
      });
    }
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];

        this.isStaff();
      },
    );
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.staff = false;
  }

  onQuickSellSubmit(form: NgForm){
    this.userService.getUserByAlias(form.value.buyer).subscribe(
      res => {
        this.buyerDetails = res as User;

        if (this.buyerDetails == null){
          this.isNum = /^\d+$/.test(form.value.buyer);
          if (this.isNum) {
            if (form.value.buyer > this.participants.length || form.value.buyer < 1){
              this.quickSellErrorMessage = 'Bidder number not found.';
              setTimeout(() => this.quickSellErrorMessage = '', 4000);
            }
            else {
              this.itemInfo.buyerID = this.participants[form.value.buyer - 1]._id;
              this.itemService.editItem(this.itemInfo).subscribe(
                res => {
                  this.quickSellSuccessMessage = true;
                  setTimeout(() => this.quickSellSuccessMessage = false, 4000);
                  this.quickSellErrorMessage = '';
                }
              )
            }
          }
          else {
            this.quickSellErrorMessage = 'No user with this alias found.';
            setTimeout(() => this.quickSellErrorMessage = '', 4000);
          }
        }
        else {
          this.itemInfo.buyerID = this.buyerDetails._id;
          this.itemService.editItem(this.itemInfo).subscribe(
            res => {
              this.quickSellSuccessMessage = true;
              setTimeout(() => this.quickSellSuccessMessage = false, 4000);
              this.quickSellErrorMessage = '';
            }
          );
        }
      }
    );
  }

  onDeleteImage(selectImage){
    var temp;

    for (let image of this.images){
      if (selectImage == image._id){
        temp = image.filename;

        for (var i = 0; i < this.itemInfo.images.length; i++){
          if (temp == this.itemInfo.images[i]){
            this.itemInfo.images.splice(i, 1);
            this.images.splice(i, 1);
            this.itemService.deleteImage(selectImage).subscribe();
            window.location.reload();
          }
        }
      }
    }
  }

  getParticipants(auctionID){
    this.auctionService.getAuctionParticipants(auctionID).subscribe(
      res => {
        this.participants = res as User [];

        for (var i = 0; i < this.participants.length; i++){
          if (this.participants[i]._id == this.itemInfo.buyerID){
            this.buyerAlias = this.participants[i].alias;
            this.bidderNum = i + 1;
          }
        }
      }
    )
  }

  onSelectImage(image: any){
    this.imagesToUpload = [];
    this.imgMsg = '';

    if (image.files){
      if ((image.files.length + this.images.length) > 5){
        this.imgMsg = 'Maximum 5 images.';
      }
      else {
        this.imagesToUpload = image.files;
      }      
    }
    else {
      this.imagesToUpload = null;
    }
  }

  onAddImage(){
    this.formData = new FormData();

    if (this.imagesToUpload){
      for (let img of this.imagesToUpload){
        this.itemInfo.images.push(img.name);
        this.images.push(img);
        this.formData.append('images', img);
      }

      this.itemService.uploadImages(this.formData).subscribe();
      window.location.reload();
    }
  }
}
