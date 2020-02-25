// get built-in libraries
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// get components
import { UserService } from '../user/service/user.service';
import { User } from '../user/model/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private userService: UserService, 
    private router: Router,
    ) { }

  userDetails = new User;
  staff : boolean;

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];

        this.isStaff(); 
      }
    );
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.staff = false;
  }

  onLogout(){
    this.userService.deleteToken();
    this.router.navigate(['/user/signin']);
  }
}
