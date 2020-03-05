// get built in
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// get components
import { environment } from '../../../environments/environment';
import { Item } from '../model/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient) { }

  // httpMethods
  addItem(item: Item){
    return this.http.post(environment.itemUrl + '/addItem', item);
  }

  uploadImages(images: FormData){
    return this.http.post(environment.itemUrl + '/uploadImages', images);
  }

  getItemsInAuction(auctionID: String){
    return this.http.get(environment.itemUrl + '/findItemsInAuction/' + auctionID);
  }

  getBuyerItems(buyerID: String){
    return this.http.get(environment.itemUrl + '/getBuyerItems/' + buyerID);
  }

  getSellerItemsInAuction(item: Item){
    return this.http.post(environment.itemUrl + '/getSellerItemsInAuction/', item);
  }

  getItemInfoById(id: String){
    return this.http.get(environment.itemUrl + '/getItemInfoById/' + id);
  }

  editItem(item: Item){
    return this.http.put(environment.itemUrl + '/editItem', item);
  }

  deleteItemById(id: String){
    return this.http.delete(environment.itemUrl + '/deleteItemById/' + id);
  }

  getItemByItemCode(itemCode: String){
    return this.http.get(environment.itemUrl + '/getItemByItemCode/' + itemCode);
  }

  defineOrder(order: number []){
    return this.http.post(environment.itemUrl + '/defineOrder', { order });
  }
}
