// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';

// get components
import { ItemService } from '../../service/item.service';
import { Item } from '../../model/item.model';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

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
  ) { }

  ngOnInit() {
    this.getItemInfo();
    this.getUser();
  }

  // Variables
  itemID = this.route.snapshot.paramMap.get('id');
  itemInfo = new Item();
  sellerInfo = new User();
  showSucessMessage : boolean;
  serverErrorMessages : string;
  userDetails = new User();
  staff : boolean;
  numRegex = /^[1-9][0-9]*$/;
  aliasRegex = /[A-Za-z]{3}/;
  currencyRegex = /^\$?(([1-9](\d*|\d{0,2}(,\d{3})*))|0)(\.\d{1,2})?$/;
  code: string;
  buyerDetails = new User();
  quickSellSuccessMessage: boolean;
  quickSellErrorMessage: string;

  getItemInfo(){
    this.itemService.getItemInfoById(this.itemID).subscribe(
      res => {
        this.itemInfo = res as Item;
        this.code = this.itemInfo.itemCode[3];
        this.getSellerInfo();
      },
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

    this.itemService.editItem(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.serverErrorMessages = '';
      },
      err => {
       this.serverErrorMessages = 'Duplicate item code.';
      }
    );
  }

  onDeleteItem(){
    if (confirm('Are you sure to delete this item?') === true){
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
    this.userService.getUserByAlias(form.value.alias).subscribe(
      res => {
        this.buyerDetails = res as User;

        if (this.buyerDetails == null){
          this.quickSellErrorMessage = 'No user with this alias found.';
          setTimeout(() => this.quickSellErrorMessage = '', 4000);
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
}
