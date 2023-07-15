// Import necessary modules and services
import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// Angular component decorator
@Component({
  // Defines the name of the component as used in templates
  selector: 'app-login',
  // Path to the HTML template associated with this component
  templateUrl: './login.component.html',
  // Path to the CSS file(s) associated with this component
  styleUrls: ['./login.component.css']
})
// Implementing OnInit interface for lifecycle hook
export class LoginComponent {
  // Define properties for form group, loading state and error message
  loginForm: FormGroup = new FormGroup({});
  isLoading = false;
  errorMessage: string | null = null;

  // Dependency injection for SharedService, ApiService, and Router services in constructor
  constructor(private sharedService: SharedService, private apiService: ApiService, private readonly router: Router) {
    // Initialize the form with validation rules for email and password fields
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    });
  }

  // On form submit, set loading state and make API call to log in
  onSubmit(): void {
    this.isLoading = true;
    this.apiService.login(this.loginForm.value).subscribe({
      // If login succeeds, handle login result
      next: result => this.handleLogin(result),
      // On error, display error message
      error: error => this.errorMessage = 'Login failed. Please try again.',
      // When observable completes, reset loading state
      complete: () => this.isLoading = false
    })
  }

  // Method to handle login result
  handleLogin(result: any): void {
    if (result) {
      // If result exists, set user data, auth token, and navigate to locations page
      this.sharedService.user = result.user;
      this.sharedService.auth_token = result.auth_token;
      this.router.navigate(['/locations']);
    } else {
      // If login fails, display error message and reset form and login data
      this.errorMessage = 'Invalid credentials. Please try again.';
      this.resetLoginData();
    }
  }

  // Method to reset login data and form
  resetLoginData(): void {
    this.sharedService.user = undefined;
    this.sharedService.auth_token = '';
    this.sharedService.login = {
      email: '',
      password: ''
    };
    this.loginForm.reset();
  }
}
