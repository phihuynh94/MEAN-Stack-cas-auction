import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";

import { Item } from '../../model/item.model';
import { ItemService } from '../../service/item.service';
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';


@Component({
  selector: 'app-quick-sell',
  templateUrl: './quick-sell.component.html',
  styleUrls: ['./quick-sell.component.css']
})
export class QuickSellComponent implements OnInit {

  constructor(private itemService: ItemService,
    private route: ActivatedRoute,
    private userService: UserService) { }

    showSucessMessage: boolean;
    serverErrorMessages: string;
    auctionID = this.route.snapshot.paramMap.get('id');
    userDetails = new User();
    sellerID: String;
    item = new Item();

  ngOnInit() {
    this.item.auctionID = this.auctionID;
    this.getUser();
  }

  onSubmit(form: NgForm) {
    this.item.auctionID = this.auctionID;
    this.item.itemCode = form.value.itemCode;
    this.item.itemName = form.value.itemName;
    this.item.description = form.value.description;
    this.item.price = form.value.price;
    this.item.quantity = form.value.quantity;
    this.item.sellerID = this.sellerID;
    this.item.type = 'quick sell';

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
        this.sellerID = this.userDetails._id;
      }
    );
  }
}
