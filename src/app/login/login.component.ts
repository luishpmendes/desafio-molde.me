import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = {
    email: '',
    password: ''
  };
  user: any;
  auth_token = '';

  constructor(private sharedService: SharedService, private apiService: ApiService, private readonly router: Router) {
    this.login = this.sharedService.login;
    this.user = this.sharedService.user;
    this.auth_token = this.sharedService.auth_token;
  }

  onSubmit(): void {
    this.apiService.login(this.login).subscribe(result => {
      console.log('Login result:');
      console.log(result);
      if (result) {
        console.log('Login successful');
        this.user = result.user;
        this.sharedService.user = result.user;
        this.auth_token = result.auth_token;
        this.sharedService.auth_token = result.auth_token;
        this.router.navigate(['/locations']);
      } else {
        // Login failed
        console.log('Login failed');
        this.user = undefined;
        this.sharedService.user = undefined;
        this.auth_token = '';
        this.sharedService.auth_token = '';
      }
    });
  }
}
