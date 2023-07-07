import { Component } from '@angular/core';
import { SharedService } from './shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Desafio';
  login = {
    email: '',
    password: ''
  };
  user: any;
  auth_token = '';

  constructor(private sharedService: SharedService) {
    this.login = this.sharedService.login;
    this.user = this.sharedService.user;
    this.auth_token = this.sharedService.auth_token;
  }
}
