import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '../location';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private sharedService: SharedService, private apiService: ApiService, private readonly router: Router) {
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.apiService.login(this.loginForm.value).subscribe({
      next: result => this.handleLogin(result),
      error: error => this.errorMessage = 'Login failed. Please try again.',
      complete: () => this.isLoading = false
    })
  }

  handleLogin(result: any): void {
    if (result) {
      this.sharedService.user = result.user;
      this.sharedService.auth_token = result.auth_token;
      this.router.navigate(['/locations']);
    } else {
      // Login failed
      this.errorMessage = 'Invalid credentials. Please try again.';
      this.resetLoginData();
    }
  }

  resetLoginData(): void {
    this.sharedService.user = undefined;
    this.sharedService.auth_token = '';
    this.sharedService.login = {
      email: '',
      password: ''
    };
    this.loginForm.reset();
  }

  trackById(index: number, location: Location): number {
    return location.id;
  }
}
