// get built-in library
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// get components
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../user.component.css']
})
export class SignInComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router ) { }

  // Variables
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  serverErrorMessages: string;
  user = {
    email: '',
    password: ''
  };

  ngOnInit() {
    // Check if user is already logged in
    if(this.userService.isLoggedIn())
      // If user already logged in -> /dashboard
      this.router.navigateByUrl('/dashboard');
  }

  // Submit function
  onSubmit(form: NgForm){
    form.value.email = form.value.email.toLowerCase();
    // Call user login function from nodejs
    this.userService.login(form.value).subscribe(
      res => {
        this.userService.setToken(res['token']);
        this.router.navigateByUrl('/dashboard');
      },
      err => {
        this.serverErrorMessages = err.error.message;
      }
    );
  }
}
