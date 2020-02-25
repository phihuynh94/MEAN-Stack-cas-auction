// get built in
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// get components
import { environment } from '../../../environments/environment';
import { Auction } from '../model/auction.model';

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  constructor(private http: HttpClient) { }

  // httpMethods
  createAuction(auction: Auction){
    return this.http.post(environment.auctionUrl + '/createAuction', auction);
  }

  getAllAuctionsInfo(){
    return this.http.get(environment.auctionUrl + '/findAllAuctions');
  }

  getAuctionInfoById(id: String){
    return this.http.get(environment.auctionUrl + '/findAuctionById/' + id);
  }

  editAuction(auction: Auction){
    return this.http.put(environment.auctionUrl + '/editAuction/' + auction._id, auction);
  }

  participateAuction(auctionID: String, participantID: String){
    return this.http.post(environment.auctionUrl + '/participateAuction/' + auctionID, { participantID });
  }

  deleteAuction(id: String){
    return this.http.delete(environment.auctionUrl + '/deleteAuction/' + id);
  }

  getAuctionParticipants(id: String){
    return this.http.get(environment.auctionUrl + '/auctionParticipants/' + id);
  }

  notParticipate(auctionID: String, participantID: String){
    return this.http.put(environment.auctionUrl + '/notParticipate/' + auctionID, { participantID });
  }
}
