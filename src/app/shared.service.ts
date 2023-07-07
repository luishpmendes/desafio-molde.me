import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  login = {
    email: '',
    password: ''
  };
  user: any;
  auth_token = '';
}
