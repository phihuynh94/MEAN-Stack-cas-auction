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

  getItemInfo(){
    this.itemService.getItemInfoById(this.itemID).subscribe(
      res => {
        this.itemInfo = res as Item;
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
    this.itemService.editItem(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
      },
      err => {
       this.serverErrorMessages = 'Error in editing item';
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
}
