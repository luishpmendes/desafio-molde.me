import { Injectable } from '@angular/core';
import { Locations } from './locations';

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
  locations: Locations = {} as Locations;
}
