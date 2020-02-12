// get built-in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// get components
import { UserService } from '../service/user.service';
import { User } from '../model/user.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['../user.component.css'],
})

export class SignUpComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
    ) { }

  // Variables
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  aliasRegex = /[A-Za-z]{3}/;
  showSucessMessage: boolean;
  serverErrorMessages: string;

  // New User object
  user: User = {
    _id: '',
    firstName: '',
    lastName: '',
    alias: '',
    email: '',
    password: '',
    type: '',
  }

  ngOnInit() {
  }

  // Submit function
  onSubmit(form : NgForm) {
    // Call addUser function from nodejs
    this.userService.addUser(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.resetForm(form);
        setTimeout(() => this.router.navigateByUrl('/user/signin'), 4000);
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else
          this.serverErrorMessages = 'Something went wrong. Please contact admin.';
      }
    );
  }

  // Reset form function
  resetForm(form: NgForm) {
    this.user = {
      _id: '',
      firstName: '',
      lastName: '',
      alias: '',
      email: '',
      password: '',
      type: '',
    };

    form.resetForm();
    this.serverErrorMessages = '';
  }
}
