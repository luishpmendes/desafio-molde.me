// Angular core module import, to use the Injectable decorator.
import { Injectable } from '@angular/core';
// Local import of the Location interface.
import { Location } from './location';

// Injectable decorator is used to mark a class as available to be provided and injected as a dependency.
@Injectable({
  // 'root' means this service is provided in the root injector and can be used across the whole app.
  providedIn: 'root'
})
export class SharedService {
  // login object with default empty string values for email and password properties, used for storing user login data.
  login = {
    email: '',
    password: ''
  };

  // Variable to store user information after successful login.
  user: any;

  // String to store authentication token received from backend API.
  auth_token = '';

  // Array of Location objects to store locations received from backend API.
  locations: Array<Location> = [];
}
