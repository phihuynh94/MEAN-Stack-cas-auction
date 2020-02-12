// get built in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";

// get components
import { Item } from '../../model/item.model';
import { ItemService } from '../../service/item.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {

  showSucessMessage: boolean;
  serverErrorMessages: string;
  auctionID = this.route.snapshot.paramMap.get('id');
  userDetails = new User();
  imageSrc: String = "../../../assets/thumbnail.jpg";
  imageToUpload: File = null;
  numOfImages = 0;
  imagesListSrc: String;
  sellerItems;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private userService: UserService,
    )
    {}

  item: Item = {
    _id: '',
    auctionID: this.auctionID,
    itemCode: '',
    itemName: '',
    description: '',
    price: null,
    quantity: null,
    sellerID: '',
    buyerID: '',
    images: [],
  }

  ngOnInit() {
    this.item.auctionID = this.auctionID;
    this.getUser();
  }

  onSubmit(form: NgForm) {
    this.item.auctionID = this.auctionID;
    this.item.itemCode = this.userDetails.alias + '-' + (this.sellerItems.length + 1);
    this.item.itemName = form.value.itemName;
    this.item.description = form.value.description;
    this.item.quantity = form.value.quantity;
    this.item.sellerID = this.userDetails._id;

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
          this.serverErrorMessages = 'Something went wrong. Please contact admin.';
      }
    );
  }

  resetForm(form: NgForm) {
    this.item = {
      _id: '',
      auctionID: this.auctionID,
      itemCode: '',
      itemName: '',
      description: '',
      price: null,
      quantity: null,
      sellerID: '',
      buyerID: '',
      images: [],
    };

    form.resetForm();
    this.serverErrorMessages = '';
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
        this.getSellerItems();
      },
      err => { 
        console.log(err);
      }
    );
  }

  getSellerItems(){
    this.item.sellerID = this.userDetails._id;

    this.itemService.getSellerItemsInAuction(this.item).subscribe(
      res => {
        this.sellerItems = res as Item[];
      },
      err => {
        console.log(err);
      }
    );
  }

  selectImage(image: any){

    if (image.files && image.files[0]){
      this.imageToUpload = image.files[0];

      // Show image preview
      const reader = new FileReader();

      reader.onload = (event:any) => {
        this.imageSrc = event.target.result;
      }
      reader.readAsDataURL(this.imageToUpload);
    }
    else {
      this.imageSrc = "../../../assets/thumbnail.jpg";
      this.imageToUpload = null;
    }
  }

  uploadImage(){
    if (this.imageToUpload){

      this.item.images[this.numOfImages] = this.imageToUpload;

      this.numOfImages += 1;

      this.imageSrc = "../../../assets/thumbnail.jpg";

      this.imageToUpload = null;
    }
    else {
      console.log('No image selected');
    }

    console.log(this.item.images[this.numOfImages - 1]);
    console.log(this.item.images);

    console.log(this.item.images[0].name);

    this.imagesListSrc = "../../../assets/" + this.item.images[0].name;

    console.log(this.imagesListSrc);
  }
}
