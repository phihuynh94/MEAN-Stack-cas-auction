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
  aliasRegex = /^[A-Za-z]{3,10}$/;
  phoneRegex = /[0-9]{3}[0-9]{3}[0-9]{4}/
  showSucessMessage: boolean;
  serverErrorMessages: string;
  user = new User();

  ngOnInit() {
  }

  // Submit function
  onSubmit(form : NgForm) {

    form.value.type = 'member';

    // Call addUser function from nodejs
    this.userService.addUser(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 2000);
        this.resetForm(form);
        setTimeout(() => this.router.navigateByUrl('/user/signin'), 2000);
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join('<br/>');
        }
        else
          this.serverErrorMessages = err.error.text;
      }
    );
  }

  // Reset form function
  resetForm(form: NgForm) {
    this.user = new User();
    form.resetForm();
    this.serverErrorMessages = '';
  }
}
