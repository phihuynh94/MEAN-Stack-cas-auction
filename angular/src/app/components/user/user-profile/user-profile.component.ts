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
  serverErrorMessages: string;
  newPassword = '';
  aliasRegex = /[A-Za-z]{3}/;

  ngOnInit() {
    this.getUser();
  }

  getUser(){
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res['user'];
      },
      err => { 
        console.log(err);
      }
    );
  }

  onEditProfileSubmit(form: NgForm){
    this.userService.editUser(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else
          this.serverErrorMessages = 'Something went wrong.Please contact admin.';
      }
    );
  }

  changePasswordSubmit(form: NgForm){
    this.userService.login(form.value).subscribe(
      res => {
        this.userService.changePassword(res, this.newPassword).subscribe(
          res => {
            this.showSucessMessage = true;
            setTimeout(() => this.showSucessMessage = false, 4000);
          },
          err => {}
        );
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else if (err.status === 404) {
          this.serverErrorMessages = 'Wrong password';
          setTimeout(() => this.serverErrorMessages = '', 4000);
        }
        else
          this.serverErrorMessages = 'Something went wrong.Please contact admin.';
      }
    );
  }
}
