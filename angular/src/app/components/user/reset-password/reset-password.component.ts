// get built-in
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// get components
import { UserService } from '../service/user.service';
import { User } from '../model/user.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../user.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
  ) { }

  token = this.route.snapshot.paramMap.get('token');
  password = {
    newPassword: '',
    confirmPassword: '',
  }
  showSucessMessage: boolean;
  serverErrorMessages: string;
  errorMessage: string;

  ngOnInit() {
  }

  onSubmit(form: NgForm){
    if (form.value.newPassword == form.value.confirmPassword){
      this.userService.resetPassword(this.token, form.value.newPassword).subscribe(
        res => {
          this.showSucessMessage = true;
          setTimeout(() => this.showSucessMessage = false, 4000);
          setTimeout(() => this.router.navigateByUrl('/user/signin'), 4000);
        },
        err => {
          this.serverErrorMessages = 'This reset password link is not working.';
        }
      );
    }
    else {
      this.errorMessage = 'Confirm password doesn\'t match.';
    }
  }
}
