// get built-in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

// get components
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../user.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private userService: UserService,
  ) { }

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSucessMessage: boolean;
  serverErrorMessages: String;

  ngOnInit() {
  }

  user = {
    email: '',
  };
  
  onSubmit(form: NgForm){
    this.userService.forgotPassword(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
      },
      err => {
        this.serverErrorMessages = err.error.message;
        setTimeout(() => this.serverErrorMessages = '', 4000);
      }
    );
  }
}
