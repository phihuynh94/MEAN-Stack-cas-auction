// get built in
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

// get components
import { UserService } from '../../user/service/user.service';
import { User } from '../../user/model/user.model';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  constructor(
    private userService: UserService,
  ) { }

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  aliasRegex = /[A-Za-z]{3}/;
  showSucessMessage: boolean;
  serverErrorMessages: string;
  user = new User();

  ngOnInit() {
  }

  onSubmit(form : NgForm) {
    this.userService.addUser(form.value).subscribe(
      res => {
        this.showSucessMessage = true;
        setTimeout(() => this.showSucessMessage = false, 4000);
        this.resetForm(form);
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

  resetForm(form: NgForm) {
    this.user = new User();
    form.resetForm();
    this.serverErrorMessages = '';
  }
}
