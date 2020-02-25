// get built-in libraries
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// get components
import { UserService } from '../user/service/user.service';
import { User } from '../user/model/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  userDetails = new User;
  staff: boolean;

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

  onLogout(){
    this.userService.deleteToken();
    this.router.navigate(['/user/signin']);
  }

  isStaff(){
    if (this.userDetails.type == 'staff')
      this.staff = true;
    else
      this.router.navigate(['/dashboard']);
  }
}
