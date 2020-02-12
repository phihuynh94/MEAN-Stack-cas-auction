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

  ngOnInit() {
  }

  user = {
    email: '',
    password: ''
  };

  showCode: boolean = false;
  
  onForgotPassword(form: NgForm){
    console.log(form.value);
    this.userService.forgotPassword(form.value).subscribe();
  }
}
