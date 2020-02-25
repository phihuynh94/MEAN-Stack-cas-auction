// get built-in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

// get components
import { UserService } from '../service/user.service';
import { User } from '../model/user.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private userService: UserService, 
  ) { }

  userDetails = new User;
  showSucessMessage: boolean;
  showSucessMessage2: boolean;
  serverErrorMessages: string;
  serverErrorMessages2: string;
  newPassword = '';
  aliasRegex = /[A-Za-z]{3}/;

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
      }
    );
  }

  onEditProfileSubmit(form: NgForm){
    this.userService.editUser(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.serverErrorMessages = '';
      },
      err => {
          this.serverErrorMessages = err.error.text;
      }
    );
  }

  changePasswordSubmit(form: NgForm){
    this.userService.login(form.value).subscribe(
      res => {
        this.userService.changePassword(res, this.newPassword).subscribe(
          res => {
            this.showSucessMessage2 = true;
            setTimeout(() => this.showSucessMessage2 = false, 4000);
          },
          err => {}
        );
      },
      err => {
        if (err.status === 404) {
          this.serverErrorMessages2 = 'Wrong password';
          setTimeout(() => this.serverErrorMessages2 = '', 4000);
        }
        else
          this.serverErrorMessages2 = 'Something went wrong.Please contact admin.';
      }
    );
  }
}
