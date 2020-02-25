// get built in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

// get components
import { AuctionService } from '../../service/auction.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.css']
})
export class ParticipantsListComponent implements OnInit {

  constructor(
    private auctionService: AuctionService,
    private route: ActivatedRoute,
  ) 
  {}

  // Variables
  auctionId = this.route.snapshot.paramMap.get('id');;
  participantsInfo;

  ngOnInit() {
    this.getParticipants();
  }

  // get all participants in the auction
  getParticipants(){
    this.auctionService.getAuctionParticipants(this.auctionId).subscribe(
      res => {
        this.participantsInfo = res as User[];
      }
    )
  }

  // refresh
  refresh() {
    this.getParticipants();
  }
}
