import { Component, OnInit , ViewChild, HostListener} from '@angular/core';

// get components
import { ItemService } from '../service/item.service';
import { Item } from '../model/item.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  constructor(
    private itemService: ItemService,
  ) { }

  @ViewChild("menu", {static: false}) insideElement;
  @ViewChild("menubtn", {static: false}) menubtn;
  
  @HostListener('document:click', ['$event.target'])

  items;
  numItems = 5;
  imgUrl = this.itemService.imgUrl;

  ngOnInit() {
    this.getAllItems();
  }

  getAllItems(){
    this.itemService.getAllItems().subscribe(
      res => {
        this.items = res as Item;
      }
    );
  }
}
