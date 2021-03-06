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

  imgUrl = 'http://localhost:8080/item/getItemImages/';
  
  // httpMethods
  addItem(item: Item){
    return this.http.post(environment.itemUrl + '/addItem', item);
  }

  uploadImages(images: FormData){
    return this.http.post(environment.itemUrl + '/uploadImages', images);
  }

  deleteImage(imageID: string){
    return this.http.delete(environment.itemUrl + '/deleteImage/' + imageID);
  }

  deleteImageByName(imageName: string){
    return this.http.delete(environment.itemUrl + '/deleteImageByName/' + imageName);
  }

  getImage(imageName: string){
    return this.http.get(environment.itemUrl + '/getImage/' + imageName);
  }

  getAllItems(){
    return this.http.get(environment.itemUrl + '/getAllItems');
  }

  getItemsInAuction(auctionID: string){
    return this.http.get(environment.itemUrl + '/findItemsInAuction/' + auctionID);
  }

  getBuyingItems(buyerID: string){
    return this.http.get(environment.itemUrl + '/getBuyingItems/' + buyerID);
  }

  getSellingItems(sellerID: string){
    return this.http.get(environment.itemUrl + '/getSellingItems/' + sellerID);
  }

  getSellerItemsInAuction(item: Item){
    return this.http.post(environment.itemUrl + '/getSellerItemsInAuction/', item);
  }

  getItemInfoById(id: string){
    return this.http.get(environment.itemUrl + '/getItemInfoById/' + id);
  }

  editItem(item: Item){
    return this.http.put(environment.itemUrl + '/editItem', item);
  }

  deleteItemById(id: string){
    return this.http.delete(environment.itemUrl + '/deleteItemById/' + id);
  }

  removePaidItem(item){
    return this.http.put(environment.itemUrl + '/removePaidItem', item);
  }
}
