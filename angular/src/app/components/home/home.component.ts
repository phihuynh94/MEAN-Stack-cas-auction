import { Component, OnInit , ViewChild, HostListener} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  toggle = false;
  constructor() { }
  @ViewChild("menu", {static: false}) insideElement;
  @ViewChild("menubtn", {static: false}) menubtn;
  
  @HostListener('document:click', ['$event.target'])

  public onClick(targetElement) {
    const clickedInside = this.insideElement.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.toggle = false;
    }
  }
  ngOnInit() {
  }
  onMenuClick() {
    this.toggle = !this.toggle;
  }
}
